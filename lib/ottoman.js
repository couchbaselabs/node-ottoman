var util = require('util');
var Schema = require('./schema');
var StoreAdapter = require('./storeadapter');
var ModelInstance = require('./modelinstance');
var autofns = require('./autofns');

function TypeDef() {
}

/**
 * The core manager class for the ODM.
 *
 * @constructor
 */
function Ottoman() {
  this.namespace = '';
  this.store = null;
  this.models = {};
  this.types = {};
  this.delayedBind = {};

  Object.defineProperty(this, 'bucket', {
    get: function() {
      if (this.store instanceof StoreAdapter.Couchbase) {
        return this.store.bucket;
      } else {
        throw new Error('Cannot access bucket property after a non-Couchbase store was set.');
      }
    },
    set: function(bucket) {
      this.store = new StoreAdapter.Couchbase(bucket);
    }
  })
}

/**
 * Returns the currently specific namespace prefix for this manager.
 *
 * @returns {string}
 */
Ottoman.prototype.nsPrefix = function() {
  if (this.namespace) {
    return this.namespace + '::';
  } else {
    return '';
  }
};

/**
 * Returns whether the passed type is a typedef object.
 *
 * @param {*} type
 * @returns {boolean}
 */
Ottoman.prototype.isTypeDef = function(type) {
  return type instanceof TypeDef;
};

/**
 * Returns whether the passed type is a model instance.
 *
 * @param {*} model
 * @returns {boolean}
 */
Ottoman.prototype.isModel = function(model) {
  return model.super_ === ModelInstance;
};

/**
 * Returns the type data for a specific type by name.  This can be
 * a model, a typedef or a core type.
 *
 * @param {string} type
 * @returns {ModelInstance|TypeDef|CoreType}
 */
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

/**
 * Parses a user's field definition to it's internal representation.
 *
 * @param {Object} options
 * @returns {*}
 * @private
 * @ignore
 */
Ottoman.prototype._parseFieldType = function(options) {
  if (!options) {
    throw new Error('Encountered blank field definition');
  }

  if (Array.isArray(options)) {
    if (options.length !== 1) {
      throw new Error('Must specify 1-lengthed array.');
    }

    return new Schema.ListField(
      this._parseFieldType(options[0])
    );
  }

  if (!(options instanceof Object)) {
    throw new Error('Inexpected field options type.');
  }

  if (options.type === undefined && options.ref === undefined) {
    var grp = new Schema.FieldGroup();

    for (var i in options) {
      if (options.hasOwnProperty(i)) {
        var field = this._makeField(i, options[i]);
        grp.fields.push(field);
      }
    }

    return grp;
  } else if (options.ref) {
    if (options.type) {
      throw new Error('Cannot specify both type and ref.');
    }

    if (typeof options.ref !== 'string') {
      if (!this.isModel(options.ref)) {
        throw new Error('References must point to models.');
      }
      options.ref = options.ref.name;
    } else {
      var typeObj = this.typeByName(options.ref);
      if (Schema.isCoreType(typeObj)) {
        throw new Error('References cannot point to core types.');
      }
    }

    return new Schema.ModelRef(options.ref);
  } else if (typeof options.type === 'string') {
    var realType = this.typeByName(options.type);
    if (!realType) {
      throw new Error('Unsupported field type name `' + options.type + '`.');
    }

    return realType;
  }

  if (this.isTypeDef(options.type)) {
    var typeDef = options.type;
    for (var i in typeDef) {
      if (typeDef.hasOwnProperty(i)) {
        options[i] = typeDef[i];
      }
    }
    return this._parseFieldType(options);
  }

  return options.type;
};

/**
 * Creates the internal representation of a model's field.
 *
 * @param {string} name
 * @param {Object} fieldDef
 * @returns {Schema.Field}
 * @private
 * @ignore
 */
Ottoman.prototype._makeField = function(name, fieldDef) {
  if (name === 'id') {
    throw new Error('No user-defined fields may have the name `id`.');
  }

  if (typeof fieldDef === 'string' ||
      this.isModel(fieldDef) ||
      Schema.isCoreType(fieldDef) ||
      this.isTypeDef(fieldDef)) {
    fieldDef = {type: fieldDef};
  }

  var field = new Schema.Field();
  field.name = name;
  field.readonly = (fieldDef.readonly === true);
  field.type = this._parseFieldType(fieldDef);
  field.validator = fieldDef.validator;

  if (fieldDef.auto) {
    if (fieldDef.default) {
      throw new Error('Property `' + name + '` cannot be both auto and have a default defined');
    }

    if (fieldDef.auto === 'uuid') {
      if (field.type !== Schema.StringType) {
        throw new Error('Automatic uuid properties must be string typed.')
      }
      field.default = autofns.uuid;
    }
  } else if (fieldDef.default) {
    if (field.type === Schema.DateType && fieldDef.default === Date.now) {
      field.default = function() { return new Date(); };
    } else {
      field.default = fieldDef.default;
    }
  }

  return field;
};

/**
 * Creates an ottoman schema from a name, schema definition and schema options.
 *
 * @param {string} name
 * @param {Object} schemaDef
 * @param {Object} options
 *  @param {Object[]} options.index
 *  @param {Object[]} options.queries
 *  @param {string} options.id="_id"
 *  @param {StoreAdapter} options.store=this.store
 * @returns {Schema}
 * @private
 * @ignore
 */
Ottoman.prototype._createSchema = function(name, schemaDef, options) {
  var schema = new Schema(this);
  schema.name = name;

  for (var i in schemaDef) {
    /* istanbul ignore else */
    if (schemaDef.hasOwnProperty(i)) {
      var field = this._makeField(i, schemaDef[i]);
      schema.addField(field);
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
      var idField = this._makeField('_id', {
        type: 'string',
        auto: 'uuid',
        readonly: true
      });
      schema.addField(idField);
    }
    schema.setIdField('_id');
  } else {
    schema.setIdField(options.id);
  }

  if (options.store) {
    schema.store = options.store;
  } else {
    schema.store = this.store;
  }

  return schema;
};

Ottoman.prototype._findModelsByRefDocIndex = function(model, fields, values, options, callback) {
  var schema = model.schema;
  var refKey = schema.refKey(fields, values);
  schema.store.get(refKey, function (err, data, cas) {
    if (err) {
      if (schema.store.isNotFoundError(err)) {
        callback(null, []);
        return;
      }
      callback(err, null);
      return;
    }

    var mdl = model.refByKey(data);
    mdl.load(function(err) {
      if (err) {
        if (schema.store.isNotFoundError(err)) {
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

Ottoman.prototype._findModelsByDefIndex = function(type, model, fields, values, options, callback) {
  var schema = model.schema;
  var mdlName = schema.namePath();
  var idxName = schema.indexName(fields);

  var indexOpts = {};
  indexOpts.key = values;

  if (options.limit) {
    indexOpts.limit = options.limit;
  }

  schema.store.searchIndex(type, mdlName, idxName, indexOpts, function(err, res) {
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

  if (arguments.length < 2 + index.fields.length + 1) {
    throw new Error('Not enough values passed to index function.');
  }

  var values = [];
  for (var i = 0; i < index.fields.length; ++i) {
    values.push(arguments[2+i]);
  }
  var options = arguments[2 + index.fields.length + 0];
  var callback = arguments[2 + index.fields.length + 1];
  if (options instanceof Function) {
    callback = options;
    options = {};
  }

  if (index instanceof Schema.RefDocIndexFn) {
    this._findModelsByRefDocIndex(model, fields, values, options, callback);
  } else {
    this._findModelsByDefIndex(index.type, model, fields, values, options, callback);
  }
};

Ottoman.prototype._countModels = function(model, filter, callback) {
  if (filter instanceof Function) {
    callback = filter;
    filter = {};
  }

  var schema = model.schema;
  var mdlName = schema.namePath();

  schema.store.count('n1ql', mdlName, {filter:filter}, function(err, res) {
    callback(err, res);
  });
};

Ottoman.prototype._findModels = function(model, filter, options, callback) {
  if (options instanceof Function) {
    callback = options;
    options = {};
  }

  var schema = model.schema;
  var mdlName = schema.namePath();

  var findOpts = {filter: filter};
  for (var i in options) {
    if (options.hasOwnProperty(i)) {
      findOpts[i] = options[i];
    }
  }

  schema.store.find('n1ql', mdlName, findOpts, function(err, res) {
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

Ottoman.prototype._findModelsByQuery = function(mdlInst, model, query, callback) {
  var remoteTypeName = query.of;
  var remoteType = this.typeByName(remoteTypeName);
  if (!remoteType) {
    throw new Error('Cannot use query without the other type being registered first!');
  }

  this._findModelsByDefIndex(query.type, remoteType, [query.field], [mdlInst.id()], {}, callback);
};

Ottoman.prototype._buildModel = function(name, schemaDef, options) {
  if (options === undefined) {
    options = {};
  }

  var schema = this._createSchema(name, schemaDef, options);

  var model = null;
  eval('model = function ' + name + '() { ModelInstance.apply(this, arguments); }');
  util.inherits(model, ModelInstance);

  model.schema = schema;

  model.create = ModelInstance.create;
  model.namePath = ModelInstance.namePath;
  model.ref = ModelInstance.ref;
  model.refByKey = ModelInstance.refByKey;
  model.getById = ModelInstance.getById;
  model.fromData = ModelInstance.fromData;
  model.pre = ModelInstance.pre;
  model.post = ModelInstance.post;
  model.find = ModelInstance.find;
  model.count = ModelInstance.count;

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

  var fieldData = this._makeField('', fieldDef);

  var typeDef = new TypeDef();
  for (var i in fieldData) {
    if (fieldData.hasOwnProperty(i)) {
      if (fieldData[i] !== undefined && i !== 'name') {
        typeDef[i] = fieldData[i];
      }
    }
  }

  this.types[name] = typeDef;
  return typeDef;
};

/**
 * Creates a typedef specifying a simple name to specify a list of field options.
 *
 * @param {string} name
 * @param {Object} options
 * @returns {TypeDef}
 */
Ottoman.prototype.type = function(name, options) {
  return this._buildAndRegisterTypeDef(name, options);
};

/**
 * Creates and registers a model object.
 *
 * @param {string} name
 * @param {Object} schemaDef
 * @param {Object} options
 *  @param {Object[]} options.index
 *  @param {Object[]} options.queries
 *  @param {string} options.id="_id"
 *  @param {StoreAdapter} options.store=this.store
 * @returns {ModelInstanceCtor}
 */
Ottoman.prototype.model = function(name, schemaDef, options) {
  return this._buildAndRegisterModel(name, schemaDef, options);
};

/**
 * Executes the validation logic against a model and throws
 * exceptions for any failures.
 *
 * @param {ModelInstance} mdlInst
 */
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
    schema.store.createIndex(index.type, schema.namePath(), index.name, index.fields, function(err) {
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

/**
 * Ensures all currently registered indices have been persisted to the data
 * store and are useable.
 *
 * @param {Function} callback
 */
Ottoman.prototype.ensureIndices = function(callback) {
  var self = this;

  var models = [];
  var stores = [];
  for (var i in this.models) {
    if (this.models.hasOwnProperty(i)) {
      var model = this.models[i];
      models.push(model);
      if (stores.indexOf(model.schema.store) === -1) {
        stores.push(model.schema.store);
      }
    }
  }

  if (models.length === 0) {
    callback(null);
    return;
  }

  function _ensureAllStores() {
    var proced = 0;
    for (var i = 0; i < stores.length; ++i) {
      stores[i].ensureIndices(function(err) {
        if (err) {
          proced = stores.length;
          callback(err);
          return;
        }

        proced++;
        if (proced === stores.length) {
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
          _ensureAllStores();
        }
      });
    }
  }
  _ensureAllModels();
};

/**
 * Returns a specific model based on the name.
 *
 * @param {string} name
 * @param {boolean} prefixed
 * @returns {ModelInstanceCtor}
 */
Ottoman.prototype.getModel = function(name, prefixed) {
  if (prefixed) {
    var prefix = this.nsPrefix();
    var namePrefix = name.substr(0, prefix.length);
    if (namePrefix !== prefix) {
      throw new Error('Model does not have the expected prefix (`' + namePrefix + '` != `' + prefix + '`).');
    }
    name = name.substr(prefix.length);
  }

  var model = this.models[name];
  if (!model) {
    return null;
  }
  return model;
};

/**
 * Decodes a model instance from a data object.
 *
 * @param {Object} data
 * @param {string} type
 * @returns {ModelInstance}
 */
Ottoman.prototype.fromCoo = function(data, type) {
  if (type) {
    type = this.nsPrefix() + type;
  }

  if (data._type) {
    if (type) {
      if (type !== data._type) {
        throw new Error('Coo data was not of expected type.');
      }
    }
    type = data._type;
  } else {
    if (!type) {
      throw new Error('No type information could be deduced.');
    }
  }

  var model = this.getModel(type, true);
  if (!model) {
    throw new Error('Could not find model matching type `' + type + '`.');
  }

  return model.fromData(data);
};

/**
 * Encodes a model instance to its JSON representation.
 *
 * @param {ModelInstance} obj
 * @returns {Object}
 */
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
