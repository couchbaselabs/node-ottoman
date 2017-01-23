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

module.exports = EmbeddedSchemaType;
