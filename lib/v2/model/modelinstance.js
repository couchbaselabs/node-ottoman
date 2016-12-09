'use strict';

var util = require('util');
var SchemaInstance = require('../schema/schemainstance')

function ModelInstance(model, info) {
  SchemaInstance.call(this, model.schema, info);
}
util.inherits(ModelInstance, SchemaInstance);

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

module.exports = ModelInstance;
