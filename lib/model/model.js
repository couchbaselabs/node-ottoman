'use strict';

var util = require('util');
var ottopath = require('./../ottopath/ottopath');
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
   * @type {ottopath.Path}
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
  var parsedPath = ottopath.parse(path);

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

  this.idField = ottopath.parse(parsedPath);
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
 * @param {string} id
 * @returns {ModelInstance}
 */
Model.prototype.ref = function(id) {
  /** @type Function */
  var ModelType = this;
  return new ModelType(new ModelInstance._ModelRefToken(id));
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

/**
 * Returns whether the passed value is a model or not.
 *
 * @param {*} value
 * @returns {boolean}
 */
Model.isModel = function(value) {
  return value instanceof Function && value.super_ === ModelInstance;
};

Model.populate = function(instance, data) {

};

module.exports = Model;
