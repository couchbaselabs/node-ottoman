var uuid = require('uuid');
var util = require('util');
var Schema = require('./schema');
var couchbase = require('couchbase');
var StoreAdapter = require('./storeadapter');

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
      } else if (field.type === Schema.DateType) {
        if ((!this[i] instanceof Date)) {
          throw new Error('Expected property `' + i + '` to be a Date.');
        }
        objOut[i] = this[i].toISOString();
      } else if (field.type === Schema.MixedType) {
        if (this[i] instanceof ModelInstance) {
          objOut[i] = this[i]._toJSON(field.type.name, forceTyping);
        } else if (this[i] instanceof Date) {
          objOut[i] = {
            '_type': 'Date',
            'v': this[i].toISOString()
          };
        } else {
          objOut[i] = this[i];
        }
      } else {
        if (this[i] instanceof Object) {
          throw new Error('Expected non-object type but got object.');
        }
        objOut[i] = this[i];
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
    bucket.remove(key, null, function(err) {
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
    bucket.store(key, refKey, null, function(err) {
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
  var proced = 0;
  for (var i = 0; i < keys.length; ++i) {
    bucket.remove(keys[i], null, function() {
      proced++;
      if (proced === keys.length) {
        callback(null);
        return;
      }
    });
  }
}

ModelInstance.prototype.save = function(callback) {
  var $ = this.$;
  var newKey = _modelKey(this);
  var newData = this.toJSON();
  var newRefKeys = $.schema.refKeys(this);

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

    $.schema.bucket.store(newKey, newData, $.cas, function(err, cas) {
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
  $.schema.bucket.get(key, function(err, data, cas) {
    if (err) {
      callback(err);
      return;
    }

    var md = new ModelData();
    md.key = $.key;
    md.data = data;
    md.cas = cas;
    ModelInstance.applyData(self, md);
    callback(null);
  });
};

ModelInstance.getById = function(id, callback) {
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
  return model.super_ === ModelInstance;
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
  schema.bucket.get(refKey, function (err, data, cas) {
    if (err) {
      if (schema.bucket.isNotFoundError(err)) {
        callback(null, []);
        return;
      }
      callback(err, null);
      return;
    }

    var mdl = model.refByKey(data);
    mdl.load(function(err) {
      if (err) {
        if (schema.bucket.isNotFoundError(err)) {
          callback(null, []);
          return;
        }
        callback(err, null);
        return;
      }
      callback(null, [mdl]);
    });
  });
};

Ottoman.prototype._findModelsByDefIndex = function(type, model, fields, values, callback) {
  var schema = model.schema;
  var idxName = schema.indexName(fields);

  schema.bucket.searchIndex(type, schema.name, idxName, {key:values}, function(err, res) {
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
      results[i].load(function() {
        // Ignore load errors and just return an unloaded object instead.

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

  if (index instanceof Schema.RefDocIndexFn) {
    this._findModelsByRefDocIndex(model, fields, values, callback);
  } else {
    this._findModelsByDefIndex(index.type, model, fields, values, callback);
  }
};

Ottoman.prototype._findModelsByQuery = function(mdlInst, model, query, callback) {
  var remoteTypeName = query.of;
  var remoteType = this._typeByName(remoteTypeName);
  if (!remoteType) {
    throw new Error('Cannot use query without the other type being registered first!');
  }

  this._findModelsByDefIndex(query.type, remoteType, [query.field], [mdlInst.id()], callback);
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
  model.getById = ModelInstance.getById;

  var self = this;
  for (var i = 0; i < schema.indexFns.length; ++i) {
    var ifn = schema.indexFns[i];
    model[ifn.name] = this._findModelByIndex.bind(this, model, ifn);
  }
  for (var i = 0; i < schema.queryFns.length; ++i) {
    var qfn = schema.queryFns[i];
    model.prototype[qfn.name] = function(callback) {
      self._findModelsByQuery(this, model, qfn, callback);
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

Ottoman.prototype._ensureModelIndices = function(model, callback) {
  var schema = model.schema;

  var modelIndices = [];
  for (var i = 0; i < schema.indices.length; ++i) {
    var index = schema.indices[i];

    if (!(index instanceof Schema.RefDocIndex)) {
      var idxName = schema.indexName(index.fields);

      var fields = [];
      for (var i = 0; i < index.fields.length; ++i) {
        var fieldName = index.fields[i];
        var fieldInfo = schema.field(fieldName);
        if (fieldInfo.type instanceof Schema.ModelRef) {
          fields.push(fieldName + '.$ref');
        } else {
          fields.push(fieldName);
        }
      }

      modelIndices.push({
        type: index.type,
        name: idxName,
        fields: fields
      });
    }
  }

  if (modelIndices.length === 0) {
    callback(null);
    return;
  }

  var proced = 0;
  for (var i = 0; i < modelIndices.length; ++i) {
    var index = modelIndices[i];
    schema.bucket.createIndex(index.type, schema.name, index.name, index.fields, function(err) {
      if (err) {
        proced = modelIndices.length;
        callback(err);
        return;
      }

      proced++;
      if (proced === modelIndices.length) {
        callback(null);
        return;
      }
    });
  }
};

Ottoman.prototype.ensureIndices = function(callback) {
  var self = this;

  var models = [];
  var buckets = [];
  for (var i in this.models) {
    if (this.models.hasOwnProperty(i)) {
      var model = this.models[i];
      models.push(model);
      if (buckets.indexOf(model.schema.bucket) === -1) {
        buckets.push(model.schema.bucket);
      }
    }
  }

  if (models.length === 0) {
    callback(null);
    return;
  }

  function _ensureAllBuckets() {
    var proced = 0;
    for (var i = 0; i < buckets.length; ++i) {
      buckets[i].ensureIndices(function(err) {
        if (err) {
          proced = buckets.length;
          callback(err);
          return;
        }

        proced++;
        if (proced === buckets.length) {
          callback(null);
          return;
        }
      });
    }
  }

  function _ensureAllModels() {
    var proced = 0;
    for (var i = 0; i < models.length; ++i) {
      self._ensureModelIndices(models[i], function (err) {
        if (err) {
          proced = models.length;
          callback(err);
          return;
        }

        proced++;
        if (proced === models.length) {
          _ensureAllBuckets();
        }
      });
    }
  }
  _ensureAllModels();
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
ottoman.StoreAdapter = StoreAdapter;
ottoman.CbStoreAdapter = StoreAdapter.Couchbase;

module.exports = ottoman;
