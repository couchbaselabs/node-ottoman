'use strict';

var util = require('util');
var SchemaType = require('./schematype');

/**
 *
 * @param {Schema} schema
 * @constructor
 * @augments {SchemaType}
 */
function EmbeddedSchemaType(schema) {
  SchemaType.call(this);

  /**
   * @type {Schema}
   * @readonly
   */
  this.schema = schema;
}
util.inherits(EmbeddedSchemaType, SchemaType);

/**
 *
 * @param {*} value
 * @returns {*}
 */
EmbeddedSchemaType.prototype.coerceValue = function(value) {
  if (value instanceof this.schema) {
    return value;
  } else {
    var SchemaType = this.schema;
    return new SchemaType(value);
  }
};

/**
 * @param {*} value
 * @throws Error
 */
EmbeddedSchemaType.prototype.validateValue = function(value) {
  // TODO: Actually test EmbeddedSchemaType stuff
};

module.exports = EmbeddedSchemaType;
