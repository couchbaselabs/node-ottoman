'use strict';

var util = require('util');
var SchemaField = require('./schemafield');
var SchemaInstance = require('./schemainstance');
var BooleanType = require('./types/booleantype');
var DateType = require('./types/datetype');
var MixedType = require('./types/mixedtype');
var NumberType = require('./types/numbertype');
var StringType = require('./types/stringtype');

/**
 * <b>DO NOT CONSTRUCT DIRECTLY.</b> Use {@see Schema::new} instead.
 *
 * @constructor
 * @augments Function
 */
function Schema() {
  /**
   * @member name
   * @memberof Schema
   * @type {string}
   * @readonly
   */

  /**
   * @type {boolean}
   * @private
   */
  this.liveValidation = true;

  /**
   * @type {Object.<string, SchemaField>}
   * @private
   */
  this.fields = {};
}

/**
 *
 */
Schema.prototype.disableLiveValidation = function() {
  this.liveValidation = false;
};

/**
 *
 * @param {string} name
 * @param {SchemaField} field
 */
Schema.prototype.addField = function(name, field) {
  if (this.fields[name]) {
    throw new Error('Field named `' + name + '` already exists.');
  }

  if (!(field instanceof SchemaField)) {
    throw new Error('Field must be a SchemaField');
  }

  this.fields[name] = field;
};

/**
 * @callback FieldCallback
 * @param {string} name
 * @param {SchemaField} field
 */

/**
 *
 * @param {FieldCallback} callback
 */
Schema.prototype.forEachField = function(callback) {
  for (var i in this.fields) {
    if (this.fields.hasOwnProperty(i)) {
      callback(i, this.fields[i]);
    }
  }
};

/**
 *
 * @param {string} name
 * @returns {SchemaField}
 */
Schema.prototype.getField = function(name) {
  if (!this.fields[name]) {
    return null;
  }

  return this.fields[name];
};

// TODO: getFieldAt should use ottopath.
/**
 *
 * @param {String} path
 * @returns {SchemaField}
 */
Schema.prototype.getFieldAt = function(path) {
  // TODO: This needs to follow a path
  return this.getField(path);
};

// TODO: getTypeAt should use ottopath.
/**
 *
 * @param {string} path
 * @returns {SchemaType}
 */
Schema.prototype.getTypeAt = function(path) {
  // TODO: Maybe improve this name?
  // TODO: Implement getTypeAt
};

/**
 *
 * @param {string} path
 * @param {SchemaInstance} obj
 * @returns {*}
 */
Schema.prototype.getValueAt = function(obj, path) {
  if (!(obj instanceof this)) {
    throw new Error('getValueAt only works against objects of this schema');
  }

  // TODO: Make this check OBJ is a Schema object...
  // Find the value at the path...
};

/**
 *
 * @param {string} name
 * @returns {Schema}
 */
Schema.new = function(name) {
  var schema = null;
  eval( // jshint -W061
    'schema = function ' + name + '() {\n' +
    '    var args = Array.prototype.slice.call(arguments);\n' +
    '    SchemaInstance.apply(this, [schema].concat(args));\n' +
    '}\n');
  util.inherits(schema, SchemaInstance);

  Schema.call(schema);
  for (var i in Schema.prototype) {
    if (Schema.prototype.hasOwnProperty(i)) {
      schema[i] = Schema.prototype[i];
    }
  }

  return schema;
};

/**
 * Returns whether the passed value is a schema
 *
 * @param {*} value
 * @returns {boolean}
 */
Schema.isSchema = function(value) {
  return value instanceof Function && value.super_ === SchemaInstance;
};

/**
 *
 * @param {string} name
 * @returns {SchemaType}
 */
Schema.getTypeByName = function(name) {
  if (name === 'string') {
    return new StringType();
  } else if (name === 'Date') {
    return new DateType();
  } else if (name === 'number') {
    return new NumberType();
  } else if (name === 'boolean') {
    return new BooleanType();
  } else if (name === 'mixed') {
    return new MixedType();
  }

  return null;
};

module.exports = Schema;
