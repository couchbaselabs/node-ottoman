'use strict';

var util = require('util');
var ModelIndex = require('./modelindex');
var ModelInstance = require('./modelinstance');
var StringType = require('./../schema/types/stringtype');

/**
 * <b>DO NOT CONSTRUCT DIRECTLY.</b> Use {@see Ottoman::model} instead.
 *
 * @constructor
 */
function Model(schema) {
  /**
   * @type {Schema}
   */
  this.schema = schema;

  /**
   * @type {string}
   */
  this.idField = undefined;

  /**
   * @type {ModelIndex[]}
   */
  this.indexes = [];

  /**
   * @type {StoreAdapter}
   */
  this.store = null;
}

/**
 * @callback IndexCallback
 * @param {ModelIndex} index
 */

/**
 *
 * @param {IndexCallback} callback
 */
Model.prototype.forEachIndex = function(callback) {
  for (var i = 0; i < this.indexes.length; ++i) {
    callback(this.indexes[i]);
  }
};

/**
 *
 * @param {ModelIndex} index
 */
Model.prototype.addIndex = function(index) {
  // TODO: Improve index creation stuff
};

/**
 *
 * @param {string} path
 */
Model.prototype.setIdField = function(path) {
  var field = this.schema.getFieldAt(path);
  if (!field) {
    throw new Error('id path does not specify a valid field');
  }

  if (!(field.type instanceof StringType)) {
    throw new Error('id field must be of string type');
  }

  if (!field.readonly) {
    throw new Error('id field must be read-only');
  }

  if (!field.required) {
    throw new Error('id field must be required');
  }

  this.idField = path;
};

/**
 *
 * @param {StoreAdapter} store
 */
Model.prototype.setStore = function(store) {
  this.store = store;
};

/**
 *
 * @param {string} name
 * @param {Schema} schema
 * @returns {Model}
 */
Model.new = function(name, schema) {
  var model = null;
  eval( // jshint -W061
    'model = function ' + name + '() {\n' +
    '    var args = Array.prototype.slice.call(arguments);\n' +
    '    ModelInstance.apply(this, [model].concat(args));\n' +
    '}\n');
  util.inherits(model, ModelInstance);

  Model.call(model, schema);
  for (var i in Model.prototype) {
    if (Model.prototype.hasOwnProperty(i)) {
      model[i] = Model.prototype[i];
    }
  }

  return model;
};

Model.populate = function(instance, data) {

};

module.exports = Model;
