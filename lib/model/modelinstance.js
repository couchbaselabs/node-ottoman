'use strict';

var util = require('util');
var SchemaInstance = require('../schema/schemainstance')

/**
 *
 * @param {string} id
 * @constructor
 * @private
 */
function _ModelRefToken(id) {
  /** @type string */
  this.id = id;
}

/**
 *
 * @param {Model} model
 * @param {*} info
 * @constructor
 */
function ModelInstance(model, info) {
  SchemaInstance.call(this, model.schema, SchemaInstance._LateConstructToken);

  var meta = this.$;

  meta.id = null;

  if (arguments.length === 2 && arguments[1] instanceof _ModelRefToken) {
    /** @type _ModelRefToken */
    var refToken = arguments[1];

    meta.id = refToken.id;
  } else {
    SchemaInstance._lateConstruct(this, info);
    meta.id = this.id();
  }
}
util.inherits(ModelInstance, SchemaInstance);

/**
 *
 * @returns {string}
 */
ModelInstance.prototype.id = function() {
  /** @type Model */
  var model = this.constructor;

  model.idField.query([this]);


  // TODO: Implement this
  return 'FAKE_ID';
};

/**
 *
 * @returns {boolean}
 */
ModelInstance.prototype.loaded = function() {
  return this.$.ctored;
};

/**
 * @callback LoadCallback
 * @param {Error} error
 */

/**
 *
 * @param {...string} pathsToLoad
 * @param {LoadCallback} callback
 */
ModelInstance.prototype.load = function(callback) {

};

/**
 * @callback SaveCallback
 * @param {Error} error
 */

/**
 *
 * @param {SaveCallback} callback
 */
ModelInstance.prototype.save = function(callback) {
  console.log('ModelInstance::save');
};

ModelInstance.prototype.inspect = function(depth, options) {
  if (!this.loaded()) {
    return this.constructor.name + '(unloaded, id:' + this.id() + ')';
  }

  var newOptions = Object.assign({}, options, {
    depth: options.depth === null ? null : options.depth - 1
  });

  var padding = ' '.repeat(2);

  var schema = this.constructor.schema;
  var data = {};
  schema.forEachField(function(name) {
    data[name] = this[name];
  }.bind(this));

  return this.constructor.name + '(' +
      (this.loaded() ? 'loaded' : 'unloaded') + ', ' +
      'id:\'' + this.id() + '\',\n' +
      padding + util.inspect(data, newOptions).replace(/\n/g, '\n' + padding) +
      ')';
};

// TODO: Make sure this comment makes sense...
/**
 * - Plugin developers only -
 * Populates a reference ModelInstance with actual data and marks it as loaded.
 *
 * @param {ModelInstance} instance
 * @param {*} data
 */
ModelInstance.populate = function(instance, data) {
  if (instance.loaded()) {
    throw new Error('cannot populate an already loaded instance');
  }

  SchemaInstance._lateConstruct(instance, data);
};

ModelInstance._ModelRefToken = _ModelRefToken;

module.exports = ModelInstance;
