const util = require('util');
const jsonpath = require('jsonpath');
const _ = require('lodash');
const lodashDeep = require('lodash-deep');
const Schema = require('./schema');

_.mixin(lodashDeep);

function ModelData() {
  this.key = null;
  this.data = null;
  this.cas = null;
}

function ModelRefData() {
  this.key = null;
}

/**
 * Constructs a new model instance and for models with a default constructor,
 * applies the data in object passed to the instance.
 *
 * @param {Object} data
 * @constructor
 */
function ModelInstance() {
  // TODO: Remove this
  const args = arguments;

  const $ = (this.$ = {});
  Object.defineProperty(this, '$', {
    enumerable: false
  });

  $.schema = this.constructor.schema;
  $.key = null;
  $.cas = null;
  $.loaded = false;
  $.refKeys = [];

  if (args.length === 1 && args[0] instanceof ModelData) {
    $.key = args[0].key;
    ModelInstance.applyData(this, args[0]);
  } else if (args.length === 1 && args[0] instanceof ModelRefData) {
    $.key = args[0].key;
  } else {
    $.schema.applyDefaultsToObject(this);
    if (args.length === 1 && args[0] instanceof Object) {
      $.schema.applyUserDataToObject(this, args[0]);
    }
    $.schema.applyPropsToObj(this);
    $.loaded = true;
  }
}

/**
 * Creates a new instance of this Model from the data passed.
 *
 * @param {Object} data
 * @returns ModelInstance
 */
ModelInstance.fromData = function(data) {
  const md = new ModelData();
  md.data = data;

  const mdlInstance = new this(md);
  return mdlInstance;
};

/**
 * Applies the data passed in `data` to the model instance `mdlInst`.
 *
 * @param {ModelInstance} mdlInst
 * @param {Object} data
 */
ModelInstance.applyData = function(mdlInst, data) {
  if (!(data instanceof ModelData)) {
    throw new Error('ApplyData must be called with ModelData instance.');
  }

  const $ = mdlInst.$;
  if ($.key !== null && $.key !== data.key) {
    throw new Error('Tried to load data from wrong id.');
  }
  $.key = data.key;
  $.schema.applyDataToObject(mdlInst, data.data);
  $.cas = data.cas;
  $.loaded = true;
  $.refKeys = $.schema.refKeys(mdlInst);
};

/**
 * Creates a new ModelInstance with the passed data and then immediately
 * attempts to save it to the data store.
 *
 * @param {Object} data
 * @param {Function} callback
 */
ModelInstance.create = function(data, callback) {
  const ctorArgs = [''];
  for (let i = 0; i < arguments.length - 1; ++i) {
    ctorArgs.push(arguments[i]);
  }

  const mdlInst = new (Function.prototype.bind.apply(this, ctorArgs))(); // jshint -W058

  mdlInst.save(function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, mdlInst);
  });
};

/**
 * Returns the full name of the model, including namespace.
 *
 * @returns {string}
 */
ModelInstance.namePath = function() {
  return this.schema.namePath();
};

/**
 * Returns whether this model instance is loaded or not.
 *
 * @returns {boolean}
 */
ModelInstance.prototype.loaded = function() {
  return this.$.loaded;
};

function _modelKey(mdl) {
  if (mdl.loaded()) {
    // Force key generation
    mdl.id();
  }
  // Return the key
  return mdl.$.key;
}

/**
 * Returns the ID of this model instance.
 *
 * @returns {string}
 */
ModelInstance.prototype.id = function() {
  const $ = this.$;
  if (!$.loaded) {
    const keyPrefix = `${$.schema.namePath()}|`;
    if ($.key.substr(0, keyPrefix.length) !== keyPrefix) {
      throw new Error('The key of this object appears incorrect.');
    }
    return $.key.substr(keyPrefix.length);
  }
  const myId = $.schema.fieldVal(this, this.$.schema.idField);
  const newKey = `${$.schema.namePath()}|${myId}`;
  if ($.key !== null) {
    if ($.key !== newKey) {
      throw new Error('The Key of the object has changed!');
    }
  } else {
    $.key = newKey;
  }
  return myId;
};

function _findField(fields, name) {
  for (let i = 0; i < fields.length; ++i) {
    if (fields[i].name === name) {
      return fields[i];
    }
  }
  return null;
}

function _encodeValue(context, type, value, forceTyping, f) {
  if (context.isModel(type)) {
    if (!(value instanceof type)) {
      throw new Error(`Expected ${f.name} type to be a \`${type.name}\``);
    }
    return value._toCoo(type.name, forceTyping);
  }
  if (type instanceof Schema.ListField) {
    if (!Array.isArray(value)) {
      throw new Error(`Expected ${f.name} type to be an array.`);
    }
    const outArr = [];
    for (let i = 0; i < value.length; ++i) {
      outArr[i] = _encodeValue(context, type.type, value[i], forceTyping, f);
    }
    return outArr;
  }
  if (type instanceof Schema.FieldGroup) {
    if (!(value instanceof Object)) {
      throw new Error(`Expected ${f.name} object type but got non-object.`);
    }
    const outObj = {};
    for (const j in value) {
      /* istanbul ignore else */
      if (value.hasOwnProperty(j)) {
        const field = _findField(type.fields, j);
        if (!field) {
          throw new Error(`Cannot find field data for property \`${j}\`.`);
        }
        outObj[j] = _encodeValue(
          context,
          field.type,
          value[j],
          forceTyping,
          field
        );
      }
    }
    return outObj;
  }
  if (type instanceof Schema.ModelRef) {
    if (!(value instanceof ModelInstance)) {
      throw new Error(`Expected ${f.name} type to be a ModelInstance.`);
    }
    // Values must match stated type names, unless the reference is to
    // 'Mixed', then any reference will do.
    if (type.name !== value.$.schema.name && type.name !== 'Mixed') {
      throw new Error(
        `Expected type to be \`${type.name}\` (got \`${value.$.schema.name}\`)`
      );
    }
    return {
      _type: value.$.schema.namePath(),
      $ref: value.id()
    };
  }
  if (type === Schema.DateType) {
    if (!(value instanceof Date)) {
      // throw new Error('Expected ' + f.name + ' type to be a Date.');
      value = new Date(value);
    }
    try {
      return value.toISOString();
    } catch (err) {
      console.error(`Invalid date ${value} in ${f.name}`);
      return null;
    }
  } else if (type === Schema.MixedType) {
    if (value instanceof ModelInstance) {
      return value._toCoo(type.name, forceTyping);
    }
    if (value instanceof Date) {
      return {
        _type: 'Date',
        v: value.toISOString()
      };
    }
    return value;
  } else {
    if (value instanceof Object) {
      throw new Error(
        `Expected ${f.name} non-object type ${JSON.stringify(
          type
        )} but got object.`
      );
    }
    return value;
  }
}

/**
 * Performs serialization of this object to JSON.
 *
 * @param {string} refType The type used to reference this object.
 * @param {boolean} forceTyping Whether to force the injection
 *    of a `_type` field.
 * @returns {Object}
 * @private
 * @ignore
 */
ModelInstance.prototype._toCoo = function(refType, forceTyping) {
  const $ = this.$;
  const objOut = {};

  if (forceTyping || this.$.schema.name !== refType) {
    objOut._type = this.$.schema.namePath();
  }

  for (const i in this) {
    /* istanbul ignore else */
    if (this.hasOwnProperty(i)) {
      const field = $.schema.field(i);
      objOut[i] = _encodeValue(
        $.schema.context,
        field.type,
        this[i],
        forceTyping,
        field
      );
    }
  }
  return objOut;
};

/**
 * Returns a JSON database-serialized version of this
 *   model instance.
 *
 * @returns {Object}
 */
ModelInstance.prototype.toCoo = function() {
  return this._toCoo('Mixed', false);
};

ModelInstance.prototype.JSON = function() {
  return { ...this };
};

/**
 * Returns a JSON serialized version of this model instance.
 *
 * The JSON serialized version is the same as the Coo, with certain internals
 * changed (references) so they are not exposed outside of the DB.
 *
 * @returns {Object}
 */
ModelInstance.prototype.toJSON = function() {
  if (!this.loaded()) {
    return null;
  }

  // Starting point matches the coo, which already converts into
  // an actual json object suitable for storage.
  const val = this._toCoo();

  const refs = {};

  // Type designator is an internal that isn't part of JSON
  delete val._type;

  // Substitute coo internals for exposable DBRef
  // Docs about ref structure:
  // https://docs.mongodb.com/manual/reference/database-references/
  // Requires lodash-deep mixin.
  // Ottoman doesn't have a convention for doing this other than its own coo
  // representation; so we choose this because it's familiar to js devs, and
  // extensible; in later versions of ottoman you can add a bucket designator in
  // mongoose's $db key
  _.deepMapValues(val, function(value, path) {
    // References in toCoo normally looks like this:
    // { $ref: 'some-model-id', _type: 'ModelName' }
    // Would prefer .endsWith over this match, but not available until es6.
    if (path.match(/\$ref$/)) {
      // Path here will be path.to.something.$ref
      const pathToRef = path.split('.');

      // Modify so that refs['path.to.something'] = a mongoose reference.
      pathToRef.pop();
      const modelType = _.get(val, `${pathToRef.join('.')}._type`);
      refs[pathToRef.join('.')] = {
        $ref: modelType,
        $id: value
      };
    }
    return value;
  });

  // Replace reference data structures with the simple ID findByOID
  // the object, friendlier for REST API.
  Object.keys(refs).forEach(function(pathToRef) {
    _.set(val, pathToRef, refs[pathToRef]);
  });

  return val;
};

/**
 * A custom inspector to help with debugging of model instances.
 *
 * @private
 * @ignore
 */
ModelInstance.prototype.inspect = function() {
  let res = '';
  let name = this.$.schema.name;
  if (!name) {
    name = 'unnamed';
  }
  const attribs = [];
  if (this.$.loaded) {
    attribs.push('loaded');
  } else {
    attribs.push('unloaded');
  }
  attribs.push(`key:${this.$.key}`);

  res += `OttomanModel(\`${name}\`, ${attribs.join(', ')}, {`;
  let hasProperties = false;
  for (const i in this) {
    /* istanbul ignore else */
    if (this.hasOwnProperty(i)) {
      if (!hasProperties) {
        res += '\n';
        hasProperties = true;
      }
      res += `  ${i}: `;
      res += util.inspect(this[i]).replace(/\n/g, '\n  ');
      res += ',\n';
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
  const errs = [];
  let i = 0;
  function stepBackward() {
    if (i === -1) {
      if (errs.length > 1) {
        const err = new Error('CRITICAL Error occured while storing refdoc.');
        err.errors = errs;
        callback(err);
      } else {
        callback(errs[0]);
      }
      return;
    }
    const key = keys[i--];
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
    const key = keys[i++];
    bucket.store(key, refKey, null, function(err) {
      if (err) {
        errs.push(err);
        i -= 2;
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
  let proced = 0;
  function handler() {
    proced++;
    if (proced === keys.length) {
      callback(null);
    }
  }
  for (let i = 0; i < keys.length; ++i) {
    bucket.remove(keys[i], null, handler);
  }
}

/**
 * Saves this model instance to the data store.
 *
 * @param {Function} callback
 */
ModelInstance.prototype.save = function(callback) {
  const self = this;
  const $ = this.$;

  // Attempt to validate this object
  $.schema.execPreHandlers('save', self, function(err) {
    if (err) {
      callback(err);
      return;
    }

    $.schema.validate(self, function(err) {
      if (err) {
        callback(err);
        return;
      }

      const newKey = _modelKey(self);
      const newData = self.toCoo();
      const newRefKeys = $.schema.refKeys(self);

      const oldRefKeys = $.refKeys;
      const addedRefKeys = [];
      const removedRefKeys = [];
      for (let i = 0; i < newRefKeys.length; ++i) {
        if (oldRefKeys.indexOf(newRefKeys[i]) === -1) {
          addedRefKeys.push(newRefKeys[i]);
        }
      }
      for (let j = 0; j < oldRefKeys.length; ++j) {
        if (newRefKeys.indexOf(oldRefKeys[j]) === -1) {
          removedRefKeys.push(oldRefKeys[j]);
        }
      }

      _tryAddRefs($.schema.store, addedRefKeys, $.key, function(err) {
        if (err) {
          callback(err);
          return;
        }

        $.schema.store.store(newKey, newData, $.cas, function(err, cas) {
          if (err) {
            callback(err);
            return;
          }

          $.cas = cas;
          $.refKeys = newRefKeys;

          _tryRemoveRefs($.schema.store, removedRefKeys, function(err) {
            if (err) {
              callback(err);
              return;
            }

            $.schema.execPostHandlers('save', self, callback);
          });
        });
      });
    });
  });
};

/**
 * This is a helper method which allows us to load an array of
 *   model instances all at once.
 *
 * @param {ModelInstance[]} items
 * @param {Function} callback
 */
ModelInstance.loadAll = function(items, callback) {
  if (!Array.isArray(items)) {
    throw new Error('Must pass an array to loadAll');
  }

  const subItems = [];
  for (let i = 0; i < items.length; ++i) {
    if (items[i] && items[i] instanceof ModelInstance && !items[i].loaded()) {
      subItems.push(items[i]);
    }
  }

  let numSubLoadLeft = subItems.length;
  if (numSubLoadLeft > 0) {
    const subLoadOne = function() {
      numSubLoadLeft--;
      if (numSubLoadLeft === 0) {
        callback(null);
      }
    };
    for (let j = 0; j < subItems.length; ++j) {
      subItems[j].load(subLoadOne);
    }
  } else {
    callback(null);
  }
};

/**
 * Loads this object, or sub-objects from this object from the data store.
 * This function can be called while a model instance is already loaded to
 * reload the model instance, or to load specific sub-model-instances.
 *
 * @param {...string=} paths Paths to sub-model-instances to load.
 * @param {Function} callback
 */
ModelInstance.prototype.load = function() {
  const loadItems = [];
  let finalCallback = function() {};
  for (let i = 0; i < arguments.length; ++i) {
    if (arguments[i] instanceof Function) {
      finalCallback = arguments[i];
      break;
    } else {
      loadItems.push(arguments[i]);
    }
  }

  const self = this;
  const $ = self.$;

  function loadSubItem() {
    if (loadItems.length === 0) {
      finalCallback(null);
      return;
    }

    const mdlsToLoad = [];

    let paths = loadItems.shift();
    if (paths === '') {
      loadSubItem();
      return;
    }

    if (!Array.isArray(paths)) {
      paths = [paths];
    }

    paths.forEach(function(path) {
      const items = jsonpath.query(self, path, 1000000);
      items.forEach(function(item) {
        if (Array.isArray(item)) {
          item.forEach(function(subItem) {
            if (subItem instanceof ModelInstance) {
              mdlsToLoad.push(subItem);
            }
          });
        } else if (item instanceof ModelInstance) {
          mdlsToLoad.push(item);
        }
      });
    });

    ModelInstance.loadAll(mdlsToLoad, loadSubItem);
  }

  if (!this.loaded()) {
    $.schema.execPreHandlers('load', self, function() {
      const key = _modelKey(self);
      $.schema.store.get(key, function(err, data, cas) {
        if (err) {
          finalCallback(err);
          return;
        }

        const md = new ModelData();
        md.key = $.key;
        md.data = data;
        md.cas = cas;
        ModelInstance.applyData(self, md);
        loadSubItem();

        const deadEnd = function() {};
        $.schema.execPostHandlers('load', self, deadEnd);
      });
    });
  } else {
    loadSubItem();
  }
};

/**
 * Removes this model instance from the data store.
 *
 * @param {Function} callback
 */
ModelInstance.prototype.remove = function(callback) {
  const $ = this.$;
  const self = this;
  const key = _modelKey(this);

  // TODO: Fix this not to use refKeys
  // Check that we can generate refKeys, which implicitly checks
  //  that we are loaded if we need to be (because we have refdoc
  //  indices on this model).
  try {
    $.schema.refKeys(this);
  } catch (e) {
    callback(e);
    return;
  }

  $.schema.execPreHandlers('remove', self, function() {
    // Remove the document itself first, then remove any
    //  reference keys.  This order is important as if the
    //  reference keys fail to get removed, the references
    //  will still point to nothing.
    $.schema.store.remove(key, $.cas, function(err) {
      if (err) {
        callback(err);
        return;
      }

      _tryRemoveRefs($.schema.store, $.refKeys, function(err) {
        if (err) {
          callback(err);
          return;
        }

        const deadEnd = function(err) {
          if (err) {
            console.log(`Ottoman post-save handler returned ${err}`);
          }
        };

        $.schema.execPostHandlers('remove', self, deadEnd);
        callback(null);
      });
    });
  });
};

/**
 * Perform a filter based search to locate specific model instances.
 *
 * @param {Object} filter
 * @param {Object=} options
 *  @param {string|string[]} options.sort
 *  @param {number} options.limit
 *  @param {number} options.skip
 * @param {Function} callback
 */
ModelInstance.find = function(filter, options, callback) {
  this.schema.context._findModels(this, filter, options, callback);
};

/**
 * Performs a count of the objects matching the filter in the data store.
 *
 * @param {Object} filter
 * @param {Object=} options
 *  @param {string|string[]} options.sort
 *  @param {number} options.limit
 *  @param {number} options.skip
 * @param {Function} callback
 */
ModelInstance.count = function(filter, options, callback) {
  this.schema.context._countModels(this, filter, options, callback);
};

/**
 * Retrieves a specific model instance from the data store by ID.
 *
 * @param {string} id
 * @param {Function} callback
 */
ModelInstance.getById = function(id, options, callback) {
  if (options instanceof Function) {
    callback = options;
    options = {};
  }

  const mdl = this.ref(id);

  let loadArgs = [
    function(err) {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, mdl);
    }
  ];
  if (options.load) {
    loadArgs = options.load.concat(loadArgs);
  }
  mdl.load(...loadArgs);
};

/**
 * Creates an unloaded model instance referencing a data store item by key.
 *
 * @param {string} key
 * @returns {ModelInstance}
 */
ModelInstance.refByKey = function(key) {
  const mr = new ModelRefData();
  mr.key = key;
  return new this(mr);
};

/**
 * Registers a plugin for this model.  This function will be
 * called immediately with the model itself as the first argument,
 * and the provided options as the second argument.
 * @param {pluginFn} the plugin function.
 * @param {option} options object to pass to the plugin.
 * @returns {ModelInstance}
 */
ModelInstance.plugin = function(pluginFn, options) {
  if (!(pluginFn instanceof Function)) {
    throw new Error('Ottoman plugins must be functions');
  }

  pluginFn(this, options || {});
  return this;
};

/**
 * Creates an unloaded model instance referencing a data store item by id.
 *
 * @param {string} id
 * @returns {ModelInstance}
 */
ModelInstance.ref = function(id) {
  return this.refByKey(`${this.schema.namePath()}|${id}`);
};

/**
 * Specify a handler to be invoked prior to a particular event for this
 * ModelInstance.  The handler will always be called with two arguments:
 * the model instance, and a callback function that the handler should
 * call to continue processing.  If a pre handler calls the provided
 * callback with an error, the event will not continue.
 *
 * @param {"validate"|"save"|"load"|"remove"} event
 * @param {Function} handler
 */
ModelInstance.pre = function(event, handler) {
  return this.schema.addPreHandler(event, handler);
};

/**
 * Specify a function to be invoked following a particular event on this
 * ModelInstance.  The handler will always be called with two arguments:
 * the model instance, and a callback.
 *
 * @param {"validate"|"save"|"load"|"remove"} event
 * @param {Function} fn
 */
ModelInstance.post = function(event, fn) {
  return this.schema.addPostHandler(event, fn);
};

module.exports = ModelInstance;
