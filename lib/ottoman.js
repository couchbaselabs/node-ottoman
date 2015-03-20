var uuid = require('uuid');
var util = require('util');
var Schema = require('./schema');

function ModelData() {
  this.id = null;
  this.data = null;
  this.cas = null;
}

function ModelRefData() {
  this.id = null;
}

function ModelInstance(schema, args) {
  var $ = this.$ = {};
  Object.defineProperty(this, "$", {
    enumerable: false
  });

  $.schema = schema;
  $.id = null;
  $.cas = null;
  $.loaded = false;
  $.refKeys = [];

  if (args.length === 1 && args[0] instanceof ModelData) {
    $.id = args[0].id;
    ModelInstance.applyData(this, args[0]);
  } else if (args.length == 1 && args[0] instanceof ModelRefData) {
    $.id = args[0].id;
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
    if (!data.id) {
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
  if ($.id !== null && $.id !== data.id) {
    throw new Error('Tried to load data from wrong id.');
  }
  $.id = data.id;
  $.schema.applyDataToObject(mdlInst, data.data);
  $.cas = data.cas;
  $.loaded = true;
  $.refKeys = $.schema.refKeys(mdlInst);
};

ModelInstance.prototype.loaded = function() {
  return this.$.loaded;
};

function _modelKey(mdl) {
  return mdl.$.schema.name + '|' + mdl.id();
}

ModelInstance.prototype.id = function() {
  var $ = this.$;
  if (!$.loaded) {
    return $.id;
  }
  var newId = eval('this.' + this.$.schema.idField);
  if ($.id !== null) {
    if ($.id !== newId) {
      throw new Error('The ID of the object has changed!');
    }
  } else {
    $.id = newId;
  }
  return $.id;
};

ModelInstance.prototype._toJSON = function(refType, forceTyping) {
  var objOut = {};

  if (forceTyping || this.$.schema.name !== refType) {
    objOut._type = this.$.schema.name;
  }

  for (var i in this) {
    /* istanbul ignore else */
    if (this.hasOwnProperty(i)) {
      if (this[i] instanceof ModelInstance) {
        objOut[i] = this[i]._toJSON(this.$.schema.field(i).type.name, forceTyping);
      } else {
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
  attribs.push('id:' + this.$.id);

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
        callback(errs);
      } else {
        callback(errs[0]);
      }
      return;
    }
    var key = keys[i--];
    console.log('Reverting Stored RefKey', key);
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
    console.log('Storing RefKey', key, refKey);
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

  console.log('Refs Added:', addedRefKeys);
  console.log('Refs Removed:', removedRefKeys);

  _tryAddRefs($.schema.bucket, addedRefKeys, $.id, function(err) {
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
    md.id = $.id;
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

ModelInstance.ref = function(id) {
  var mr = new ModelRefData();
  mr.id = id;
  return new this(mr);
};

function Ottoman() {
  this.bucket = null;
  this.models = {};

  Object.defineProperty(this, "models", {
    enumerable: false
  });
}

Ottoman.prototype.isModel = function(model) {
  return model.super_ === ModelInstance && model.schema instanceof Schema;
};

Ottoman.prototype.typeByName = function(type) {
  var coreType = Schema.coreTypeByName(type);
  if (coreType) {
    return coreType;
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

Ottoman.prototype._findModelByRef = function(model, fields) {
  var values = [];
  for (var i = 2; i < arguments.length - 1; ++i) {
    values.push(arguments[i]);
  }
  var callback = arguments[arguments.length - 1];

  var refKey = model.schema.refKey(fields, values);
  model.schema.bucket.get(refKey, function(err, res) {
    if (err) {
      callback(err, null);
      return;
    }

    model.findById(res.value, callback);
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
  model.findById = ModelInstance.findById;

  for (var i = 0; i < schema.refIndexFns.length; ++i) {
    var rdifn = schema.refIndexFns[i];
    model[rdifn.name] = this._findModelByRef.bind(this, model, rdifn.fields);
  }

  return model;
};

Ottoman.prototype._buildAndRegisterModel = function(name, schemaDef, options) {
  if (this.models[name]) {
    throw new Error('A model with this name has already been registered.');
  }

  var model = this._buildModel(name, schemaDef, options);
  this.models[name] = model;
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
