var util = require('util');
var Schema = require('./schema');
var StoreAdapter = require('./storeadapter');
var ModelInstance = require('./modelinstance');

function TypeDef() {
}

function Ottoman() {
  this.bucket = null;
  this.models = {};
  this.types = {};
  this.delayedBind = {};
}

Ottoman.prototype.isTypeDef = function(type) {
  return type instanceof TypeDef;
};

Ottoman.prototype.isModel = function(model) {
  return model.super_ === ModelInstance;
};

Ottoman.prototype.typeByName = function(type) {
  var coreType = Schema.coreTypeByName(type);
  if (coreType) {
    return coreType;
  }

  var model = this.models[type];
  if (model) {
    return model;
  }

  var typedef = this.types[type];
  if (typedef) {
    return typedef;
  }

  return null;
};

Ottoman.prototype.resolveFieldDef = function(options) {
  if (!options) {
    throw new Error('Encountered blank field definition');
  }

  if (typeof options === 'string' ||
      this.isModel(options) ||
      Schema.isCoreType(options) ||
      this.isTypeDef(options)) {
    options = {type: options};
  }

  if (options.type === undefined) {
    var mdl = this._buildModel('', options, {
      id: null
    });
    options = {
      type: mdl,
      embed: true,
      default: function() { return new mdl(); }
    };
  } else if (typeof options.type === 'string') {
    var realType = this.typeByName(options.type);
    if (!realType) {
      throw new Error('Unsupported field type name `' + options.type + '`.');
    }
    options.type = realType;
  }

  if (this.isTypeDef(options.type)) {
    var typeDef = options.type;
    for (var i in typeDef) {
      if (typeDef.hasOwnProperty(i)) {
        options[i] = typeDef[i];
      }
    }
  }

  if (this.isModel(options.type)) {
    // This is a model, good to go.
  } else if (Schema.isCoreType(options.type)) {
    // This is a core type, good to go.
  } else {
    console.error(options);
    throw new Error('Unsupported field type value.');
  }

  return options;
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
  var remoteType = this.typeByName(remoteTypeName);
  if (!remoteType) {
    throw new Error('Cannot use query without the other type being registered first!');
  }

  this._findModelsByDefIndex(query.type, remoteType, [query.field], [mdlInst.id()], callback);
};

Ottoman.prototype._buildModel = function(name, schemaDef, options) {
  if (options === undefined) {
    options = {};
  }

  var schema = Schema.create(this, name, schemaDef, options);

  var model = null;
  eval('model = function ' + name + '() { ModelInstance.call(this, schema, arguments); }');
  util.inherits(model, ModelInstance);

  model.schema = schema;

  model.ref = ModelInstance.ref;
  model.refByKey = ModelInstance.refByKey;
  model.getById = ModelInstance.getById;
  model.fromData = ModelInstance.fromData;

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
  if (this.typeByName(name)) {
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

Ottoman.prototype._buildAndRegisterTypeDef = function(name, fieldDef) {
  if (this.typeByName(name)) {
    throw new Error('A model with this name has already been registered.');
  }

  fieldDef = this.resolveFieldDef(fieldDef);

  var typeDef = new TypeDef();
  for (var i in fieldDef) {
    if (fieldDef.hasOwnProperty(i)) {
      typeDef[i] = fieldDef[i];
    }
  }

  this.types[name] = typeDef;
  return typeDef;
};

Ottoman.prototype.type = function(name, options) {
  return this._buildAndRegisterTypeDef(name, options);
};

Ottoman.prototype.model = function(name, schemaDef, options) {
  return this._buildAndRegisterModel(name, schemaDef, options);
};

Ottoman.prototype.validate = function(mdlInst) {
  mdlInst.$.schema.validate(mdlInst);
};

Ottoman.prototype._ensureModelIndices = function(model, callback) {
  var schema = model.schema;

  var modelIndices = [];
  for (var i = 0; i < schema.indices.length; ++i) {
    var index = schema.indices[i];

    if (!(index instanceof Schema.RefDocIndex)) {
      var idxName = schema.indexName(index.fields);

      var fields = [];
      for (var j = 0; j < index.fields.length; ++j) {
        var fieldName = index.fields[j];
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

  return model.fromData(data);
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
