'use strict';

var util = require('util');
var SchemaInstance = require('../schema/schemainstance')
var ModelRefData = require('./modelrefdata');

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

  meta.storeData = null;
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
 * @param {string...} pathsToLoad
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

/**
 *
 * @param {string} id
 * @returns {ModelInstance}
 */
ModelInstance.ref = function(id) {
  return new this(new _ModelRefToken(id));
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
  SchemaInstance._lateConstruct(instance, data);
};

ModelInstance._ModelRefToken = _ModelRefToken;

module.exports = ModelInstance;
