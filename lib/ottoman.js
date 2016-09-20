'use strict';

var util = require('util');
var Schema = require('./schema');
var StoreAdapter = require('./storeadapter');
var CbStoreAdapter = require('./cbstoreadapter');
var MockStoreAdapter = require('./mockstoreadapter');
var ModelInstance = require('./modelinstance');
var autofns = require('./autofns');

/**
 * The data definition for a typedef object.  Typedef's are
 * simply aliases for other types.
 *
 * @constructor
 * @private
 * @ignore
 */
function TypeDef() {
}

/**
 * The core manager class for the ODM.
 *
 * @constructor
 */
function Ottoman(options) {
  if (!options) {
    options = {};
  }

  this.namespace = '';
  this.store = null;
  this.models = {};
  this.types = {};
  this.delayedBind = {};

  // Plugins are an array of arrays.
  // Each item has two elements: a [pluginFn, options]
  this.plugins = [];

  // Define the special `bucket` property which allows you to quickly
  //   specify a Couchbase Bucket to use without messing with the
  //   underlying StoreAdapters.
  Object.defineProperty(this, 'bucket', {
    get: function () {
      if (this.store instanceof StoreAdapter.Couchbase) {
        return this.store.bucket;
      } else {
        throw new Error(
          'Cannot access bucket property after non-Couchbase store set.');
      }
    },
    set: function (bucket) {
      this.store = new StoreAdapter.Couchbase(bucket);
    }
  });

  // Copy any options that were passed to the constructor onto this object.
  if (options.bucket) {
    this.bucket = options.bucket;
  }
  if (options.store) {
    this.store = options.store;
  }
  if (options.namespace) {
    this.namespace = options.namespace;
  }
}

/**
 * Registers a global plugin with ottoman.  Global plugins will be
 * attached to all models defined *after* this call.
 * @param pluginFn the plugin, which must be a function.
 * @param options an options object to pass to the plugin function
 * when it is called.
 * @returns the ottoman singleton for chaining.
 */
Ottoman.prototype.plugin = function(pluginFn, options) {
  if (!(pluginFn instanceof Function)) {
    throw new Error('Ottoman plugins must be functions');
  }

  this.plugins.push([pluginFn, (options || {})]);
  return this;
};

/**
 * Returns the currently specific namespace prefix for this manager.
 *
 * @returns {string}
 */
Ottoman.prototype.nsPrefix = function () {
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
Ottoman.prototype.isTypeDef = function (type) {
  return type instanceof TypeDef;
};

/**
 * Returns whether the passed type is a model instance.
 *
 * @param {*} model
 * @returns {boolean}
 */
Ottoman.prototype.isModel = function (model) {
  return model.super_ === ModelInstance;
};

/**
 * Returns the type data for a specific type by name.  This can be
 * a model, a typedef or a core type.
 *
 * @param {string} type
 * @returns {ModelInstance|TypeDef|CoreType}
 */
Ottoman.prototype.typeByName = function (type) {
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
Ottoman.prototype._parseFieldType = function (options) {
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

  // When a type is specified like this:
  // ottoman.model('Foo', { someField: ['string'] })
  // Then per the docs that is legitimate.  But here we arrive with an
  // options object of just 'string' which isn't valid.   So re-wrap it
  // in the format this function expects, and keep going.
  if (typeof options === 'string') {
    return this._parseFieldType({ type: options });
  }

  if (!(options instanceof Object)) {
    throw new Error('Unexpected field options type; expected either a ' +
      'valid ottoman type or an object with a type property');
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

      // As a special exception, you **are** allowed to create { ref: 'Mixed' }
      // to make a reference to any other type.  So Mixed is the only
      // "core type" you can create a reference to, others don't make sense.
      if (Schema.isCoreType(typeObj) && !(typeObj === Schema.MixedType)) {
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
    for (var j in typeDef) {
      if (typeDef.hasOwnProperty(j)) {
        options[j] = typeDef[j];
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
Ottoman.prototype._makeField = function (name, fieldDef) {
  if (name === 'id') {
    throw new Error('No user-defined fields may have the name `id`.');
  }

  if (typeof fieldDef === 'string' ||
    this.isModel(fieldDef) ||
    Schema.isCoreType(fieldDef) ||
    this.isTypeDef(fieldDef)) {
    fieldDef = { type: fieldDef };
  }

  var field = new Schema.Field();
  field.name = name;
  field.readonly = (fieldDef.readonly === true);
  field.type = this._parseFieldType(fieldDef);
  field.validator = fieldDef.validator;

  if (fieldDef.auto) {
    if (fieldDef.default) {
      throw new Error(
        'Property `' + name + '` cannot be both auto and have a default.');
    }

    if (fieldDef.auto === 'uuid') {
      if (field.type !== Schema.StringType) {
        throw new Error('Automatic uuid properties must be string typed.');
      }
      field.default = autofns.uuid;
    }
  } else if (fieldDef.default !== undefined) {
    if (field.type === Schema.DateType && fieldDef.default === Date.now) {
      field.default = function () { return new Date(); };
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
Ottoman.prototype._createSchema = function (name, schemaDef, options) {
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
    for (var j in indexFns) {
      if (indexFns.hasOwnProperty(j)) {
        schema.addIndexFn(j, indexFns[j]);
      }
    }
  }

  var queryFns = options.queries;
  if (queryFns) {
    for (var k in queryFns) {
      if (queryFns.hasOwnProperty(k)) {
        schema.addQueryFn(k, queryFns[k]);
      }
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

/**
 * Searches for a model using its refdoc key.
 *
 * @param model
 * @param fields
 * @param values
 * @param options
 * @param callback
 * @private
 * @ignore
 */
Ottoman.prototype._findModelsByRefDocIndex =
  function (model, fields, values, options, callback) {
    var schema = model.schema;
    var refKey = schema.refKey(fields, values);
    schema.store.get(refKey, function (err, data) {
      if (err) {
        if (schema.store.isNotFoundError(err)) {
          callback(null, []);
          return;
        }
        callback(err, null);
        return;
      }

      var mdl = model.refByKey(data);

      var loadArgs = [function (err) {
        if (err) {
          if (schema.store.isNotFoundError(err)) {
            callback(null, []);
            return;
          }
          callback(err, null);
          return;
        }
        callback(null, [mdl]);
      }];
      if (options.load) {
        loadArgs = options.load.concat(loadArgs);
      }

      mdl.load.apply(mdl, loadArgs);
    });
  };

/**
 * Searches for a model by using a non-refdoc index.
 *
 * @param type
 * @param model
 * @param fields
 * @param values
 * @param options
 * @param callback
 * @private
 * @ignore
 */
Ottoman.prototype._findModelsByDefIndex =
  function (type, model, fields, values, options, callback) {
    var schema = model.schema;
    var mdlName = schema.namePath();
    var idxName = schema.indexName(fields);

    var indexOpts = {};

    indexOpts.key = [];
    for (var i = 0; i < values.length; ++i) {
      if (values[i] instanceof ModelInstance) {
        indexOpts.key.push(values[i].id());
      } else {
        indexOpts.key.push(values[i]);
      }
    }

    if (options.limit !== undefined) {
      indexOpts.limit = options.limit;
    }
    if (options.consistency !== undefined) {
      indexOpts.consistency = options.consistency;
    }

    schema.store.searchIndex(
      type, mdlName, idxName, indexOpts, function (err, res) {
        if (err) {
          callback(err, null);
          return;
        }

        var results = [];
        for (var i = 0; i < res.length; ++i) {
          var obj = model.refByKey(res[i].id);
          results.push(obj);
        }

        if (results.length === 0) {
          callback(null, results);
          return;
        }

        var proced = 0;
        function handler() {
          // Ignore load errors and just return an unloaded object instead.

          proced++;
          if (proced === results.length) {
            callback(null, results);
          }
        }

        var loadArgs = [handler];
        if (options.load) {
          loadArgs = options.load.concat(loadArgs);
        }
        for (var j = 0; j < results.length; ++j) {
          results[j].load.apply(results[j], loadArgs);
        }
      });
  };

/**
 * Searches for a model by using an index.  This method will automatically
 *   select between refdoc and non-refdoc indices as their behaviours differ
 *   significantly.
 *
 * @param type
 * @param model
 * @param fields
 * @param values
 * @param options
 * @param callback
 * @private
 * @ignore
 */
Ottoman.prototype._findModelByIndex = function (model, index) {
  var fields = index.fields;

  if (arguments.length < 2 + index.fields.length + 1) {
    throw new Error('Not enough values passed to index function.');
  }

  var values = [];
  for (var i = 0; i < index.fields.length; ++i) {
    values.push(arguments[2 + i]);
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
    if (options.consistency === undefined) {
      options.consistency = index.consistency;
    }
    this._findModelsByDefIndex(
      index.type, model, fields, values, options, callback);
  }
};

/**
 * Performs a filtered count operation against a model using N1QL.
 *
 * @param model
 * @param filter
 * @param callback
 * @private
 * @ignore
 */
Ottoman.prototype._countModels = function (model, filter, options, callback) {
  if (filter instanceof Function) {
    callback = filter;
    filter = {};
  } else if (options instanceof Function) {
    callback = options;
    options = {};
  }

  var schema = model.schema;
  var mdlName = schema.namePath();

  var countOpts = { filter: this._normFilter(filter) };
  for (var i in options) {
    if (options.hasOwnProperty(i)) {
      countOpts[i] = options[i];
    }
  }

  schema.store.count('n1ql', mdlName, countOpts, function (err, res) {
    callback(err, res);
  });
};

/**
 * Normalizes a filter structure by replacing ModelInstance
 * objects with a $ref that can be passed through to n1ql.
 * @param a filter object, such as what is passed to _findModels
 * @private
 * @ignore
 */
Ottoman.prototype._normFilter = function (filter) {
  var out = {};
  for (var i in filter) {
    if (filter.hasOwnProperty(i)) {
      if (filter[i] instanceof ModelInstance) {
        out[i] = {
          '$ref': filter[i].id()
        };
      } else if (filter[i] instanceof Object) {
        out[i] = this._normFilter(filter[i]);
      } else {
        out[i] = filter[i];
      }
    }
  }
  return out;
};

/**
 * Performs a filtered find operation against a model using N1QL.
 *
 * @param model
 * @param filter
 * @param options
 * @param callback
 * @private
 * @ignore
 */
Ottoman.prototype._findModels = function (model, filter, options, callback) {
  if (options instanceof Function) {
    callback = options;
    options = {};
  }

  var schema = model.schema;
  var mdlName = schema.namePath();

  var findOpts = { filter: this._normFilter(filter) };
  for (var i in options) {
    if (options.hasOwnProperty(i)) {
      findOpts[i] = options[i];
    }
  }

  schema.store.find('n1ql', mdlName, findOpts, function (err, res) {
    if (err) {
      callback(err, null);
      return;
    }

    var results = [];
    for (var i = 0; i < res.length; ++i) {
      var obj = model.refByKey(res[i].id);
      results.push(obj);
    }

    if (results.length === 0) {
      callback(null, results);
      return;
    }

    var proced = 0;
    function handler() {
      // Ignore load errors and just return an unloaded object instead.

      proced++;
      if (proced === results.length) {
        callback(null, results);
      }
    }

    var loadArgs = [handler];
    if (options.load) {
      loadArgs = options.load.concat(loadArgs);
    }
    for (var j = 0; j < results.length; ++j) {
      results[j].load.apply(results[j], loadArgs);
    }
  });
};

/**
 * Performs a query to locate one kind of model based on another.  Internally
 *   this is done by using an index that is automatically defined as part
 *   of the query.
 *
 * @param mdlInst
 * @param model
 * @param query
 * @param callback
 * @private
 * @ignore
 */
Ottoman.prototype._findModelsByQuery =
  function (mdlInst, model, query, callback) {
    var remoteTypeName = query.of;
    var remoteType = this.typeByName(remoteTypeName);
    if (!remoteType) {
      throw new Error(
        'Cannot use query without the other type being registered first!');
    }

    var options = {};
    if (query.consistency !== undefined) {
      options.consistency = query.consistency;
    }

    this._findModelsByDefIndex(
      query.type, remoteType, [query.field], [mdlInst.id()], options, callback);
  };

/**
 * Builds a model based on a schema definition.  This is the root
 * of ottomans model class builder.
 *
 * @param name
 * @param schemaDef
 * @param options
 * @returns {*}
 * @private
 * @ignore
 */
Ottoman.prototype._buildModel = function (name, schemaDef, options) {
  if (options === undefined) {
    options = {};
  }

  var schema = this._createSchema(name, schemaDef, options);

  var model = null;
  eval( // jshint -W061
    'model = function ' + name + '() {\n' +
    '    ModelInstance.apply(this, arguments);\n' +
    '}\n');
  util.inherits(model, ModelInstance);

  model.schema = schema;

  model.create = ModelInstance.create;
  model.namePath = ModelInstance.namePath;
  model.ref = ModelInstance.ref;
  model.refByKey = ModelInstance.refByKey;
  model.plugin = ModelInstance.plugin;
  model.getById = ModelInstance.getById;
  model.fromData = ModelInstance.fromData;
  model.pre = ModelInstance.pre;
  model.post = ModelInstance.post;
  model.loadAll = ModelInstance.loadAll;
  model.find = ModelInstance.find;
  model.count = ModelInstance.count;

  // jshint -W083
  var self = this;
  for (var i = 0; i < schema.indexFns.length; ++i) {
    var ifn = schema.indexFns[i];
    model[ifn.name] = this._findModelByIndex.bind(this, model, ifn);
  }
  for (var j = 0; j < schema.queryFns.length; ++j) {
    (function (qfn) {
      model.prototype[qfn.name] = function (callback) {
        self._findModelsByQuery(this, model, qfn, callback);
      };
    })(schema.queryFns[j]);
  }
  //jshint +W083

  return model;
};

/**
 * Creates a delayed binding for a particular model type.  The method that is
 *   passed will be called at a later time when the specified model is defined.
 *   This is used to allow queries to reference models which are not yet
 *   defined, but still allow us to build the index definitions for queries
 *   that cross between them.
 *
 * @param bindType
 * @param fn
 * @private
 * @ignore
 */
Ottoman.prototype._delayBind = function (bindType, fn) {
  if (!this.delayedBind[bindType]) {
    this.delayedBind[bindType] = [];
  }
  this.delayedBind[bindType].push(fn);
};

/**
 * Builds a model based on a schema definition and then registers it with the
 *   root Ottoman objects type definition list.
 *
 * @param name
 * @param schemaDef
 * @param options
 * @returns {*}
 * @private
 * @ignore
 */
Ottoman.prototype._buildAndRegisterModel = function (name, schemaDef, options) {
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

  this._applyPlugins(model);

  return model;
};

/**
 * Applies global plugins to models as they are created.
 * @param {model} a new model that has been created.
 * @returns the ottoman singleton for chaining.
 */
Ottoman.prototype._applyPlugins = function(model) {
  for (var i = 0, l = this.plugins.length; i < l; i++) {
    model.plugin(this.plugins[i][0], this.plugins[i][1]);
  }
  return this;
};

/**
 * Builds a typedef object and then immediately registers it with the root
 *   Ottoman object's type definition list.
 *
 * @param name
 * @param fieldDef
 * @returns {TypeDef}
 * @private
 * @ignore
 */
Ottoman.prototype._buildAndRegisterTypeDef = function (name, fieldDef) {
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
 * Creates a typedef specifying a simple name for a list of field options.
 *
 * @param {string} name
 * @param {Object} options
 * @returns {TypeDef}
 */
Ottoman.prototype.type = function (name, options) {
  return this._buildAndRegisterTypeDef(name, options);
};

/**
 * Creates and registers a model object.
 *
 * @param {string} name
 * @param {Object} schemaDef
 * @param {Object} options
 *  @param {Object} options.index
 *  @param {Object} options.queries
 *  @param {string} options.id="_id"
 *  @param {StoreAdapter} options.store=this.store
 * @returns {ModelInstanceCtor}
 */
Ottoman.prototype.model = function (name, schemaDef, options) {
  return this._buildAndRegisterModel(name, schemaDef, options);
};

/**
 * Executes the validation logic against a model and throws
 * exceptions for any failures.
 *
 * @param {ModelInstance} mdlInst
 */
Ottoman.prototype.validate = function (mdlInst, callback) {
  mdlInst.$.schema.validate(mdlInst, callback);
};

Ottoman.prototype._ensureModelIndices = function (model, callback) {
  var schema = model.schema;

  var modelIndices = [];
  for (var i = 0; i < schema.indices.length; ++i) {
    var index = schema.indices[i];

    if (!(index instanceof Schema.RefDocIndex)) {
      var idxName = schema.indexName(index.fields);

      var fields = [];
      for (var j = 0; j < index.fields.length; ++j) {
        var fieldName = index.fields[j];
        var fieldType = schema.fieldType(fieldName);
        if (fieldType instanceof Schema.ModelRef) {
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
  function handler(err) {
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
  }
  for (var k = 0; k < modelIndices.length; ++k) {
    var modelIndex = modelIndices[k];
    schema.store.createIndex(modelIndex.type, schema.namePath(),
      modelIndex.name, modelIndex.fields, handler);
  }
};

/**
 * Ensures all currently registered indices have been persisted to the data
 * store and are useable.
 *
 * @param {Function} callback
 */
Ottoman.prototype.ensureIndices = function (callback) {
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
    function handler(err) {
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
    }
    for (var i = 0; i < stores.length; ++i) {
      stores[i].ensureIndices(handler);
    }
  }

  function _ensureAllModels() {
    var proced = 0;
    function handler(err) {
      if (err) {
        proced = models.length;
        callback(err);
        return;
      }

      proced++;
      if (proced === models.length) {
        _ensureAllStores();
      }
    }
    for (var i = 0; i < models.length; ++i) {
      self._ensureModelIndices(models[i], handler);
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
Ottoman.prototype.getModel = function (name, prefixed) {
  if (prefixed) {
    var prefix = this.nsPrefix();
    var namePrefix = name.substr(0, prefix.length);
    if (namePrefix !== prefix) {
      throw new Error(
        'Model does not have the expected prefix ' +
        '(`' + namePrefix + '` != `' + prefix + '`).');
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
Ottoman.prototype.fromCoo = function (data, type) {
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
Ottoman.prototype.toCoo = function (obj) {
  return obj.toCoo();
};

Ottoman.loadAll = ModelInstance.loadAll;

// Create a default Ottoman instance, and expose the class through
//   the Ottoman property of it.
var ottoman = new Ottoman();
ottoman.Ottoman = Ottoman;
ottoman.StoreAdapter = StoreAdapter;
ottoman.StoreAdapter.Couchbase = CbStoreAdapter;
ottoman.StoreAdapter.Mock = MockStoreAdapter;
ottoman.CbStoreAdapter = ottoman.StoreAdapter.Couchbase;
ottoman.MockStoreAdapter = ottoman.StoreAdapter.Mock;
ottoman.Consistency = StoreAdapter.SearchConsistency;
module.exports = ottoman;
