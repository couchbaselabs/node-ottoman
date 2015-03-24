var uuid = require('uuid');
var util = require('util');
var Schema = require('./schema');
var couchbase = require('couchbase');

function ModelData() {
  this.key = null;
  this.data = null;
  this.cas = null;
}

function ModelRefData() {
  this.key = null;
}

function ModelInstance(schema, args) {
  var $ = this.$ = {};
  Object.defineProperty(this, "$", {
    enumerable: false
  });

  $.schema = schema;
  $.key = null;
  $.cas = null;
  $.loaded = false;
  $.refKeys = [];

  if (args.length === 1 && args[0] instanceof ModelData) {
    $.key = args[0].key;
    ModelInstance.applyData(this, args[0]);
  } else if (args.length == 1 && args[0] instanceof ModelRefData) {
    $.key = args[0].key;
  } else {
    $.schema.applyDefaultsToObject(this);
    $.schema.applyPropsToObj(this);
    $.loaded = true;
  }
};

ModelInstance.applyData = function(mdlInst, data) {
  if (!data instanceof ModelData) {
    throw new Error('ApplyData must be called with ModelData instance.');
  }
  // TODO: Make this check for a top-level object!
  if (false) {
    if (!data.key) {
      throw new Error('applyData must be called with a valid ModelData id.');
    }
    if (!data.cas) {
      throw new Error('applyData must be called with a valid ModelData cas.');
    }
  }
  if (!data.data) {
    throw new Error('applyData must be called with valid ModelData data.');
  }


  var $ = mdlInst.$;
  if ($.key !== null && $.key !== data.key) {
    throw new Error('Tried to load data from wrong id.');
  }
  $.key = data.key;
  $.schema.applyDataToObject(mdlInst, data.data);
  $.cas = data.cas;
  $.loaded = true;
  $.refKeys = $.schema.refKeys(mdlInst);
};

ModelInstance.prototype.loaded = function() {
  return this.$.loaded;
};

function _modelKey(mdl) {
  // Force key generation
  mdl.id();
  // Return the key
  return mdl.$.key;
}

ModelInstance.prototype.id = function() {
  var $ = this.$;
  if (!$.loaded) {
    return $.key;
  }
  var myId = eval('this.' + this.$.schema.idField);
  var newKey = $.schema.name + '|' + myId;
  if ($.key !== null) {
    if ($.key !== newKey) {
      throw new Error('The Key of the object has changed!');
    }
  } else {
    $.key = newKey;
  }
  return myId;
};

ModelInstance.prototype._toJSON = function(refType, forceTyping) {
  var $ = this.$;
  var objOut = {};

  if (forceTyping || this.$.schema.name !== refType) {
    objOut._type = this.$.schema.name;
  }

  for (var i in this) {
    /* istanbul ignore else */
    if (this.hasOwnProperty(i)) {
      var field = $.schema.field(i);
      if ($.schema.context.isModel(field.type)) {
        if (!(this[i] instanceof field.type)) {
          throw new Error('Expected property `' + i + '` to be of type `' + field.type.name + '`');
        }
        objOut[i] = this[i]._toJSON(field.type.name, forceTyping);
      } else if (field.type instanceof Schema.ModelRef) {
        if (!(this[i] instanceof ModelInstance)) {
          throw new Error('Expected property `' + i + '` to be a ModelInstance.');
        }
        if (field.type.name !== this[i].$.schema.name) {
          throw new Error('Expected property `' + i + '` to be of type `' +
              field.type.name + '` (got `' + this[i].$.schema.name + '`)');
        }
        objOut[i] = {
          '_type': this[i].$.schema.name,
          '$ref': this[i].id()
        };
      } else {
        if (this[i] instanceof ModelInstance) {
          objOut[i] = this[i]._toJSON(field.type.name, forceTyping);
        } else {
          objOut[i] = this[i];
        }
      }
    }
  }
  return objOut;
};

ModelInstance.prototype.toJSON = function() {
  return this._toJSON('Mixed', false);
};

ModelInstance.prototype.inspect = function(depth) {
  var res = '';
  var name = this.$.schema.name;
  if (!name) {
    name = 'unnamed';
  }
  var attribs = [];
  if (this.$.loaded) {
    attribs.push('loaded');
  } else {
    attribs.push('unloaded');
  }
  attribs.push('key:' + this.$.key);

  res += 'OttomanModel(`' + name + '`, ' + attribs.join(', ') + ', {';
  var hasProperties = false;
  for (var i in this) {
    if (this.hasOwnProperty(i)) {
      if (!hasProperties) {
        res += "\n";
        hasProperties = true;
      }
      res += '  ' + i + ': ';
      res += util.inspect(this[i]).replace(/\n/g, "\n  ");
      res += ",\n";
    }
  }
  res += '})';
  return res;
};

function _tryAddRefs(bucket, keys, refKey, callback) {
  if (keys.length === 0) {
    callback(null);
    return;
  }
  var errs = [];
  var i = 0;
  function stepBackward() {
    if (i === -1) {
      if (errs.length > 1) {
        var err = new Error('CRITICAL Error occured while storing refdoc, then roll-back errored as well.');
        err.errors = errs;
        callback(err);
      } else {
        callback(errs[0]);
      }
      return;
    }
    var key = keys[i--];
    bucket.remove(key, function(err) {
      if (err) {
        errs.push(err);
      }
      stepBackward();
    });
  }
  function stepForward() {
    if (i === keys.length) {
      callback(null);
      return;
    }
    var key = keys[i++];
    bucket.insert(key, refKey, function(err) {
      if (err) {
        errs.push(err);
        --i;
        stepBackward();
        return;
      }
      stepForward();
    });
  }
  stepForward();
}

function _tryRemoveRefs(bucket, keys, callback) {
  if (keys.length === 0) {
    callback(null);
    return;
  }
  console.log('Removing Refs');
  var proced = 0;
  for (var i = 0; i < keys.length; ++i) {
    bucket.remove(keys[i], function() {
      proced++;
      console.log('PROC', proced, keys.length);
      if (proced === keys.length) {
        callback(null);
        return;
      }
    });
  }
}

function _tryUpdateDoc(bucket, key, data, cas, callback) {
  var saveHandler = function(err, res) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, res.cas);
  };
  if (cas) {
    bucket.replace(key, data, cas, saveHandler);
  } else {
    bucket.insert(key, data, saveHandler);
  }
}

ModelInstance.prototype.save = function(callback) {
  var $ = this.$;
  var newKey = _modelKey(this);
  var newData = this.toJSON();
  var newRefKeys = $.schema.refKeys(this);

  console.log('SAVE', newKey, newData, newRefKeys);

  var oldRefKeys = $.refKeys;
  var addedRefKeys = [];
  var removedRefKeys = [];
  for (var i = 0; i < newRefKeys.length; ++i) {
    if (oldRefKeys.indexOf(newRefKeys[i]) === -1) {
      addedRefKeys.push(newRefKeys[i]);
    }
  }
  for (var i = 0; i < oldRefKeys.length; ++i) {
    if (newRefKeys.indexOf(oldRefKeys[i]) === -1) {
      removedRefKeys.push(oldRefKeys[i]);
    }
  }

  _tryAddRefs($.schema.bucket, addedRefKeys, $.key, function(err) {
    if (err) {
      callback(err);
      return;
    }

    _tryUpdateDoc($.schema.bucket, newKey, newData, $.cas, function(err, cas) {
      if (err) {
        callback(err);
        return;
      }

      $.cas = cas;

      _tryRemoveRefs($.schema.bucket, removedRefKeys, function(err) {
        if (err) {
          callback(err);
          return;
        }

        callback(null);
      });
    });
  });
};

ModelInstance.prototype.load = function(callback) {
  var $ = this.$;
  var self = this;
  var key = _modelKey(this);
  $.schema.bucket.get(key, function(err, res) {
    if (err) {
      callback(err);
      return;
    }

    var md = new ModelData();
    md.key = $.key;
    md.data = res.value;
    md.cas = res.cas;
    ModelInstance.applyData(self, md);
    callback(null);
  });
};

ModelInstance.findById = function(id, callback) {
  var mdl = this.ref(id);
  mdl.load(function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, mdl);
  });
};

ModelInstance.refByKey = function(key) {
  var mr = new ModelRefData();
  mr.key = key;
  return new this(mr);
};

ModelInstance.ref = function(id) {
  return this.refByKey(this.schema.name + '|' + id);
};

function Ottoman() {
  this.bucket = null;
  this.models = {};
  this.delayedBind = {};

  Object.defineProperty(this, "models", {
    enumerable: false
  });
}

Ottoman.prototype.isModel = function(model) {
  return model.super_ === ModelInstance && model.schema instanceof Schema;
};

Ottoman.prototype._typeByName = function(type) {
  var coreType = Schema.coreTypeByName(type);
  if (coreType) {
    return coreType;
  }

  var model = this.models[type];
  if (model) {
    return model;
  }

  return null;
};

Ottoman.prototype.typeByName = function(type) {
  var typeObj = this._typeByName(type);
  if (typeObj) {
    return typeObj;
  }

  throw new Error('Invalid type specified (' + type + ')');
};

Ottoman.prototype._buildSchema = function(name, schemaDef, options) {
  var schema = new Schema(this);
  schema.name = name;

  for (var i in schemaDef) {
    /* istanbul ignore else */
    if (schemaDef.hasOwnProperty(i)) {
      schema.addField(i, schemaDef[i]);
    }
  }

  var indexFns = options.index;
  if (indexFns) {
    for (var i in indexFns) {
      schema.addIndexFn(i, indexFns[i]);
    }
  }

  var queryFns = options.queries;
  if (queryFns) {
    for (var i in queryFns) {
      schema.addQueryFn(i, queryFns[i]);
    }
  }

  if (options.id === undefined) {
    if (!schema.field('_id')) {
      schema.addField('_id', {
        type: 'string',
        auto: 'uuid',
        readonly: true
      });
    }
    schema.setIdField('_id');
  } else {
    schema.setIdField(options.id);
  }

  if (options.bucket) {
    schema.bucket = options.bucket;
  } else {
    schema.bucket = this.bucket;
  }

  return schema;
};

Ottoman.prototype._findModelsByRefDocIndex = function(model, fields, values, callback) {
  var schema = model.schema;
  var refKey = schema.refKey(fields, values);
  schema.bucket.get(refKey, function (err, res) {
    if (err) {
      callback(err, null);
      return;
    }

    var mdl = model.refByKey(res.value);
    mdl.load(function(err) {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, mdl);
    });
  });
};

Ottoman.prototype._findModelsByViewIndex = function(model, fields, values, callback) {
  var schema = model.schema;
  var ddocName = schema.ddocName();
  var viewName = schema.refKeyPrefix(fields);

  var vq = couchbase.ViewQuery.from(ddocName, viewName);
  //vq.key(values);

  console.log('QUERYING', ddocName, viewName, values);
  schema.bucket.query(vq, function(err, res) {
    console.log('QUERIED', err, res);

    if (err) {
      callback(err, null);
      return;
    }

    var results = [];
    for(var i = 0; i < res.length; ++i) {
      var obj = model.refByKey(res[i].id);
      results.push(obj);
    }

    if (results.length === 0) {
      callback(null, results);
      return;
    }

    var proced = 0;
    for (var i = 0; i < results.length; ++i) {
      results[i].load(function(err) {
        // Ignore load errors and just return an unloaded object instead.
        if (err) {
          console.log('Load Error', err);
        }

        proced++;
        if (proced === results.length) {
          callback(null, results);
        }
      });
    }
  });
};

Ottoman.prototype._findModelByIndex = function(model, index) {
  var schema = model.schema;
  var fields = index.fields;

  var values = [];
  for (var i = 2; i < arguments.length - 1; ++i) {
    values.push(arguments[i]);
  }
  var callback = arguments[arguments.length - 1];

  // TODO: Use instanceof instead!
  if (index instanceof Schema.RefDocIndexFn) {
    this._findModelsByRefDocIndex(model, fields, values, callback);
  } else if (index instanceof Schema.ViewIndexFn) {
    this._findModelsByViewIndex(model, fields, values, callback);
  } else {
    throw new Error('Unknown index type!');
  }
};

Ottoman.prototype._findModelsByQuery = function(mdlInst, model, query, callback) {
  var remoteTypeName = query.type;
  var remoteType = this._typeByName(remoteTypeName);
  if (!remoteType) {
    throw new Error('Cannot use query without the other type being registered first!');
  }

  console.log('_findModelsByQuery', query);
  this._findModelsByViewIndex(remoteType, [query.field], [mdlInst.id()], function(err, res) {
    console.log('INDEX', err, res);
  });
};

Ottoman.prototype._buildModel = function(name, schemaDef, options) {
  if (options === undefined) {
    options = {};
  }

  var schema = this._buildSchema(name, schemaDef, options);

  var model = null;
  eval('model = function ' + name + '() { ModelInstance.call(this, schema, arguments); }');

  /* istanbul ignore if */
  if (false) {
    // This exists only to show code completers that the function is in
    //   fact used, even though it only appears in the eval statement above.
    ModelInstance();
  }

  model.schema = schema;

  util.inherits(model, ModelInstance);
  model.ref = ModelInstance.ref;
  model.refByKey = ModelInstance.refByKey;
  model.findById = ModelInstance.findById;

  var self = this;
  for (var i = 0; i < schema.indexFns.length; ++i) {
    var ifn = schema.indexFns[i];
    model[ifn.name] = this._findModelByIndex.bind(this, model, ifn);
  }
  for (var i = 0; i < schema.queryFns.length; ++i) {
    var qfn = schema.queryFns[i];
    model.prototype[qfn.name] = function() {
      self._findModelsByQuery(this, model, qfn);
    };
  }

  return model;
};

Ottoman.prototype._delayBind = function(bindType, fn) {
  if (!this.delayedBind[bindType]) {
    this.delayedBind[bindType] = [];
  }
  this.delayedBind[bindType].push(fn);
};

Ottoman.prototype._buildAndRegisterModel = function(name, schemaDef, options) {
  if (this.models[name]) {
    throw new Error('A model with this name has already been registered.');
  }

  // Build the model!
  var model = this._buildModel(name, schemaDef, options);
  this.models[name] = model;

  // Notify delayed binders!
  var delayedBinds = this.delayedBind[name];
  if (delayedBinds) {
    for (var i = 0; i < delayedBinds.length; ++i) {
      delayedBinds[i]();
    }
    delete this.delayedBind[name];
  }

  return model;
};

Ottoman.prototype.model = function(name, schemaDef, options) {
  return this._buildAndRegisterModel(name, schemaDef, options);
};

Ottoman.prototype._deserializeCoo = function(model, data) {
  var md = new ModelData();
  md.data = data;

  var mdlInstance = new model(md);
  return mdlInstance;
};

function _buildViewMapFn(schema, fields) {
  var out = '';
  out += 'function(doc, meta) {\n';
  out += '  if(doc._type === \'' + schema.name + '\') {\n';

  var fieldArr = [];
  for (var i = 0; i < fields.length; ++i) {
    var schemaField = schema.field(fields[i]);
    if (schemaField.type instanceof Schema.ModelRef) {
      fieldArr.push('doc.' + fields[i] + '.$ref');
    } else {
      fieldArr.push('doc.' + fields[i]);
    }
  }
  out += '    emit([' + fieldArr.join(',') + '], null);\n';

  out += '  }\n';
  out += '}';
  return out;
}

Ottoman.prototype.ensureModelIndices = function(model, callback) {
  var schema = model.schema;

  var modelViews = {};
  var numModelViews = 0;
  for (var i = 0; i < schema.indices.length; ++i) {
    var index = schema.indices[i];

    if (index instanceof Schema.ViewIndex) {
      var fields = index.fields;
      var mrName = schema.refKeyPrefix(fields);
      var mapFn = _buildViewMapFn(schema, fields);

      modelViews[mrName] = {map: mapFn};
      numModelViews++;
    }
  }

  if (numModelViews === 0) {
    callback(null);
    return;
  }

  var ddocName = schema.ddocName();
  var ddocData = {views: modelViews};
  console.log(ddocName, ddocData);

  var bucketMgr = schema.bucket.manager();
  bucketMgr.upsertDesignDocument(ddocName, ddocData, function(err) {
    if (err) {
      callback(err);
      return;
    }
    callback(null);
  });
};

Ottoman.prototype.ensureIndices = function(callback) {
  var models = [];
  for (var i in this.models) {
    if (this.models.hasOwnProperty(i)) {
      models.push(this.models[i]);
    }
  }

  if (models.length === 0) {
    callback(null);
    return;
  }

  var proced = 0;
  for (var i = 0; i < models.length; ++i) {
    this.ensureModelIndices(models[i], function (err) {
      if (err) {
        proced = models.length;
        callback(err);
        return;
      }

      proced++;
      if (proced === models.length) {
        callback(null);
        return;
      }
    });
  }
};

Ottoman.prototype.fromCoo = function(data, type) {
  if (data._type) {
    if (type) {
      if (type !== data._type) {
        throw new Error('Coo data was not of expected type.');
      }
    }
    type = data._type;
  }

  var model = this.models[type];
  if (!model) {
    throw new Error('Could not find model matching type `' + type + '`.');
  }

  return this._deserializeCoo(model, data);
};

Ottoman.prototype.toCoo = function(obj) {
  return obj.toJSON();
};

// Create a default Ottoman instance, and expose the class through
//   the Ottoman property of it.
var ottoman = new Ottoman();
ottoman.Ottoman = Ottoman;

module.exports = ottoman;
