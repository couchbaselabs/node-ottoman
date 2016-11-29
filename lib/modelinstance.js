'use strict';

var util = require('util');
var jsonpath = require('jsonpath');
var Schema = require('./schema');
var _ = require('lodash');
var lodashDeep = require('lodash-deep');
_.mixin(lodashDeep);

/**
 * This callback is invoked by {@link ModelInstance~create}
 *
 * @callback ModelInstance~CreateCallback
 * @param {Error} err
 *   Any errors that occured while creating the object.
 * @param {ModelInstance} obj
 *   The newely minted object if no errors occured.
 */

/**
 * A special object used to pass reference data to a ModelInstance
 *  constructor.  We use this object to differentiate wanting to construct
 *  the object directly, and wanting to create a reference object.
 * @constructor
 * @ignore
 */
function ModelRefData() {
  this.id = null;
}

/**
 * Constructs a new model instance and for models with a default constructor,
 * applies the data in object passed to the instance.
 *
 * @param {Object} data
 * @constructor
 */
function ModelInstance() {
  var $ = this.$ = {};
  Object.defineProperty(this, '$', {
    enumerable: false
  });

  $.schema = this.constructor.schema;
  $.storeData = null;
  $.loaded = false;
  $.id = null;

  if (arguments.length === 1 && arguments[0] instanceof ModelRefData) {
    $.id = arguments[0].id;
  } else {
    $.schema.applyDefaultsToObject(this);

    if (arguments.length === 1 && arguments[0] instanceof Object) {
      $.schema.applyUserDataToObject(this, arguments[0]);
    }

    $.id = this.id();

    ModelInstance.markLoaded(this);
  }
}

/**
 * Creates a new ModelInstance with the passed data and then immediately
 * attempts to save it to the data store.
 *
 * @param {Object} data
 * @param {ModelInstance~CreateCallback} callback
 */
ModelInstance.create = function (data, callback) {
  var ctorArgs = [''];
  for (var i = 0; i < arguments.length - 1; ++i) {
    ctorArgs.push(arguments[i]);
  }

  var mdlInst = // jshint -W058
    new (Function.prototype.bind.apply(this, ctorArgs));

  mdlInst.save(function (err) {
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
ModelInstance.namePath = function () {
  return this.schema.namePath();
};

/**
 * Returns whether this model instance is loaded or not.
 *
 * @returns {boolean}
 */
ModelInstance.prototype.loaded = function () {
  return this.$.loaded;
};

/**
 * Returns the ID of this model instance.
 *
 * @returns {string}
 */
ModelInstance.prototype.id = function () {
  var $ = this.$;

  if (!$.id) {
    var myId = $.schema.fieldVal(this, this.$.schema.idField);
    return myId;
  }

  return $.id;
};

/**
 * Returns a JSON serialized version of this model instance.
 *
 * The JSON serialized version is the same as the Coo, with certain internals
 * changed (references) so they are not exposed outside of the DB.
 *
 * @returns {Object}
 */
ModelInstance.prototype.toJSON = function () {
  return this.$.schema.context.serializer.serializeModel(this);
};

/**
 * A custom inspector to help with debugging of model instances.
 *
 * @private
 * @ignore
 */
ModelInstance.prototype.inspect = function () {
  var res = '';
  var name = this.$.schema.name;
  if (!name) {
    name = 'unnamed';
  }

  var attribs = [];

  attribs.push('id:' + this.$.id);

  if (this.$.loaded) {
    attribs.push('loaded');
  } else {
    attribs.push('unloaded');
  }

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

/**
 * Saves this model instance to the data store.
 *
 * @param {Function} callback
 */
ModelInstance.prototype.save = function (callback) {
  var self = this;
  var $ = this.$;

  // Attempt to validate this object
  $.schema.execPreHandlers('save', self, function (err) {
    if (err) {
      callback(err);
      return;
    }

    $.schema.validate(self, function (err) {
      if (err) {
        callback(err);
        return;
      }

      $.schema.store.store(self, function(err) {
        if (err) {
          callback(err);
          return;
        }

        $.schema.execPostHandlers('save', self, callback);
      });
    });
  });
};

/**
 * Loads this object, or sub-objects from this object from the data store.
 * This function can be called while a model instance is already loaded to
 * reload the model instance, or to load specific sub-model-instances.
 *
 * @param {...string=} paths Paths to sub-model-instances to load.
 * @param {Function} callback
 */
ModelInstance.prototype.load = function () {
  var loadItems = [];
  var finalCallback = function () { };
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

    paths.forEach(function (path) {
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
    $.schema.execPreHandlers('load', self, function (err) {
      if (err) {
        finalCallback(err);
      }

      $.schema.store.load(self, function (err) {
        if (err) {
          finalCallback(err);
          return;
        }

        loadSubItem();

        var deadEnd = function () { };
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
ModelInstance.prototype.remove = function (callback) {
  var $ = this.$;
  var self = this;

  $.schema.execPreHandlers('remove', self, function (err) {
    if (err) {
      callback(err);
      return;
    }

    $.schema.store.remove(self, function (err) {
      if (err) {
        callback(err);
        return;
      }

      $.schema.execPostHandlers('remove', self, callback);
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
ModelInstance.loadAll = function (items, callback) {
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
    var subLoadOne = function () {
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
 * Perform a filter based search to locate specific model instances.
 *
 * @param {Object} filter
 * @param {Object=} options
 *  @param {string|string[]} options.sort
 *  @param {number} options.limit
 *  @param {number} options.skip
 * @param {Function} callback
 */
ModelInstance.find = function (filter, options, callback) {
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
ModelInstance.count = function (filter, options, callback) {
  this.schema.context._countModels(this, filter, options, callback);
};

/**
 * Retrieves a specific model instance from the data store by ID.
 *
 * @param {string} id
 * @param {Function} callback
 */
ModelInstance.getById = function (id, options, callback) {
  if (options instanceof Function) {
    callback = options;
    options = {};
  }

  var mdl = this.ref(id);

  var loadArgs = [function (err) {
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
 * Creates an unloaded model instance referencing a data store item by id.
 *
 * @param {string} id
 * @returns {ModelInstance}
 */
ModelInstance.ref = function (id) {
  var mr = new ModelRefData();
  mr.id = id;
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
ModelInstance.plugin = function (pluginFn, options) {
  if (!(pluginFn instanceof Function)) {
    throw new Error('Ottoman plugins must be functions');
  }

  pluginFn(this, (options || {}));
  return this;
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
ModelInstance.pre = function (event, handler) {
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
ModelInstance.post = function (event, fn) {
  return this.schema.addPostHandler(event, fn);
};

/**
 * Marks this model instance as loaded and locks it.  This should never
 *  be called by application code if the entire object has not yet been
 *  initialized.  It's meant to be used by storage adapters exclusively.
 *
 * @param mdlInst
 */
ModelInstance.markLoaded = function(mdlInst) {
  // Apply the expected properties to this object now that its loaded
  mdlInst.$.schema.applyPropsToObj(this);

  // Mark that this object is loaded
  mdlInst.$.loaded = true;
};

/**
 * Returns the Schema associated with a particular model instance.
 *
 * @param {ModelInstance} mdlInst
 * @returns {Schema}
 */
ModelInstance.getModelSchema = function(mdlInst) {
  return mdlInst.$.schema;
};

ModelInstance.getStoreData = function(mdlInst) {
  return mdlInst.$.storeData;
};

ModelInstance.setStoreData = function(mdlInst, storeData) {
  mdlInst.$.storeData = storeData;
};

module.exports = ModelInstance;
