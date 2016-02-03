'use strict';

var util = require('util');
var jsonpath = require('jsonpath');
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

/**
 * Constructs a new model instance and for models with a default constructor,
 * applies the data in object passed to the instance.
 *
 * @param {Object} data
 * @constructor
 */
function ModelInstance(data) {
  // TODO: Remove this
  var args = arguments;

  var $ = this.$ = {};
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
  var md = new ModelData();
  md.data = data;

  var mdlInstance = new this(md);
  return mdlInstance;
};

/**
 * Applies the data passed in `data` to the model instance `mdlInst`.
 *
 * @param {ModelInstance} mdlInst
 * @param {Object} data
 */
ModelInstance.applyData = function(mdlInst, data) {
  if (!data instanceof ModelData) {
    throw new Error('ApplyData must be called with ModelData instance.');
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

/**
 * Creates a new ModelInstance with the passed data and then immediately
 * attempts to save it to the data store.
 *
 * @param {Object} data
 * @param {Function} callback
 */
ModelInstance.create = function(data, callback) {
  var ctorArgs = [''];
  for (var i = 0; i < arguments.length - 1; ++i) {
    ctorArgs.push(arguments[i]);
  }

  var mdlInst = // jshint -W058
      new (Function.prototype.bind.apply(this, ctorArgs));

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
  var $ = this.$;
  if (!$.loaded) {
    var keyPrefix = $.schema.namePath() + $.schema.keyDelimiter;
    if ($.key.substr(0, keyPrefix.length) !== keyPrefix) {
      throw new Error('The key of this object appears incorrect.');
    }
    return $.key.substr(keyPrefix.length);
  }
  var myId = $.schema.fieldVal(this, this.$.schema.idField);
  var newKey = $.schema.namePath() + $.schema.keyDelimiter + myId;
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
  for (var i = 0; i < fields.length; ++i) {
    if (fields[i].name === name) {
      return fields[i];
    }
  }
  return null;
}

function _encodeValue(context, type, value, forceTyping) {
  if (context.isModel(type)) {
    if (!(value instanceof type)) {
      throw new Error('Expected type to be a `' + type.name + '`');
    }
    return value._toCoo(type.name, forceTyping);
  } else if (type instanceof Schema.ListField) {
    if (!Array.isArray(value)) {
      throw new Error('Expected type to be an array.');
    }
    var outArr = [];
    for (var i = 0; i < value.length; ++i) {
      outArr[i] = _encodeValue(context, type.type, value[i], forceTyping);
    }
    return outArr;
  } else if (type instanceof Schema.FieldGroup) {
    if (!(value instanceof Object)) {
      throw new Error('Expected object type but got non-object.');
    }
    var outObj = {};
    for (var j in value) {
      /* istanbul ignore else */
      if (value.hasOwnProperty(j)) {
        var field = _findField(type.fields, j);
        if (!field) {
          throw new Error('Cannot find field data for property `' + j + '`.');
        }
        outObj[j] = _encodeValue(context, field.type, value[j], forceTyping);
      }
    }
    return outObj;
  } else if (type instanceof Schema.ModelRef) {
    if (!(value instanceof ModelInstance)) {
      throw new Error('Expected type to be a ModelInstance.');
    }
    if (type.name !== value.$.schema.name) {
      throw new Error('Expected type to be `' +
      type.name + '` (got `' + value.$.schema.name + '`)');
    }
    return {
      '_type': value.$.schema.namePath(),
      '$ref': value.id()
    };
  } else if (type === Schema.DateType) {
    if (!(value instanceof Date)) {
      throw new Error('Expected type to be a Date.');
    }
    return value.toISOString();
  } else if (type === Schema.MixedType) {
    if (value instanceof ModelInstance) {
      return value._toCoo(type.name, forceTyping);
    } else if (value instanceof Date) {
      return {
        '_type': 'Date',
        'v': value.toISOString()
      };
    } else {
      return value;
    }
  } else {
    if (value instanceof Object) {
      throw new Error('Expected non-object type but got object.');
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
  var $ = this.$;
  var objOut = {};

  if (forceTyping || this.$.schema.name !== refType) {
    objOut._type = this.$.schema.namePath();
  }

  for (var i in this) {
    /* istanbul ignore else */
    if (this.hasOwnProperty(i)) {
      var field = $.schema.field(i);
      objOut[i] =
          _encodeValue($.schema.context, field.type, this[i], forceTyping);
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

/**
 * Returns a JSON serialized version of this model instance.
 *
 * @returns {Object}
 */
ModelInstance.prototype.toJSON = function() {
  if (!this.loaded()) {
    return null;
  }
  return this;
};

/**
 * A custom inspector to help with debugging of model instances.
 *
 * @private
 * @ignore
 */
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
    /* istanbul ignore else */
    if (this.hasOwnProperty(i)) {
      if (!hasProperties) {
        res += '\n';
        hasProperties = true;
      }
      res += '  ' + i + ': ';
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
  var errs = [];
  var i = 0;
  function stepBackward() {
    if (i === -1) {
      if (errs.length > 1) {
        var err = new Error('CRITICAL Error occured while storing refdoc.');
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
  function handler() {
    proced++;
    if (proced === keys.length) {
      callback(null);
      return;
    }
  }
  for (var i = 0; i < keys.length; ++i) {
    bucket.remove(keys[i], null, handler);
  }
}

/**
 * Saves this model instance to the data store.
 *
 * @param {Function} callback
 */
ModelInstance.prototype.save = function(callback) {
  var self = this;
  var $ = this.$;

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

      var newKey = _modelKey(self);
      var newData = self.toCoo();
      var newRefKeys = $.schema.refKeys(self);

      var oldRefKeys = $.refKeys;
      var addedRefKeys = [];
      var removedRefKeys = [];
      for (var i = 0; i < newRefKeys.length; ++i) {
        if (oldRefKeys.indexOf(newRefKeys[i]) === -1) {
          addedRefKeys.push(newRefKeys[i]);
        }
      }
      for (var j = 0; j < oldRefKeys.length; ++j) {
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

  var subItems = [];
  for (var i = 0; i < items.length; ++i) {
    if (items[i] && items[i] instanceof ModelInstance && !items[i].loaded()) {
      subItems.push(items[i]);
    }
  }

  var numSubLoadLeft = subItems.length;
  if (numSubLoadLeft > 0) {
    var subLoadOne = function(err) {
      numSubLoadLeft--;
      if (numSubLoadLeft === 0) {
        callback(null);
      }
    };
    for (var j = 0; j < subItems.length; ++j) {
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
ModelInstance.prototype.load = function(callback) {
  var loadItems = [];
  var finalCallback = function() { };
  for (var i = 0; i < arguments.length; ++i) {
    if (arguments[i] instanceof Function) {
      finalCallback = arguments[i];
      break;
    } else {
      loadItems.push(arguments[i]);
    }
  }

  var self = this;
  var $ = self.$;

  function loadSubItem() {
    if (loadItems.length === 0) {
      finalCallback(null);
      return;
    }

    var mdlsToLoad = [];

    var paths = loadItems.shift();
    if (paths === '') {
      loadSubItem();
      return;
    }

    if (!Array.isArray(paths)) {
      paths = [paths];
    }

    paths.forEach(function(path) {
      var items = jsonpath.query(self, path, 1000000);
      items.forEach(function (item) {
        if (Array.isArray(item)) {
          item.forEach(function (subItem) {
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
    var key = _modelKey(self);
    $.schema.store.get(key, function(err, data, cas) {
      if (err) {
        finalCallback(err);
        return;
      }

      var md = new ModelData();
      md.key = $.key;
      md.data = data;
      md.cas = cas;
      ModelInstance.applyData(self, md);
      loadSubItem();
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
  var $ = this.$;
  var key = _modelKey(this);
  $.schema.store.remove(key, $.cas, function(err) {
    if (err) {
      callback(err);
      return;
    }

    callback(null);
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

  var mdl = this.ref(id);

  var loadArgs = [function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, mdl);
  }];
  if (options.load) {
    loadArgs = options.load.concat(loadArgs);
  }
  mdl.load.apply(mdl, loadArgs);
};

/**
 * Creates an unloaded model instance referencing a data store item by key.
 *
 * @param {string} key
 * @returns {ModelInstance}
 */
ModelInstance.refByKey = function(key) {
  var mr = new ModelRefData();
  mr.key = key;
  return new this(mr);
};

/**
 * Creates an unloaded model instance referencing a data store item by id.
 *
 * @param {string} id
 * @returns {ModelInstance}
 */
ModelInstance.ref = function(id) {
  return this.refByKey(this.schema.namePath() + $.schema.keyDelimiter + id);
};

/**
 * Specify a handler to be invoked prior to a particular event for this
 * ModelInstance.
 *
 * @param {"validate"|"save"|"load"} event
 * @param {Function} handler
 */
ModelInstance.pre = function(event, handler) {
  return this.schema.addPreHandler(event, handler);
};

/**
 * Specify a function to be invoked following a particular event on this
 * ModelInstance.
 *
 * @param {"validate"|"save"|"load"} event
 * @param {Function} fn
 */
ModelInstance.post = function(event, fn) {
  return this.schema.addPostHandler(event, fn);
};

module.exports = ModelInstance;
