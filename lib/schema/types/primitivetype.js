'use strict';

var util = require('util');
var SchemaType = require('./schematype');

/**
 *
 * @constructor
 * @augments SchemaType
 */
function PrimitiveType() {
  SchemaType.call(this);
}
util.inherits(PrimitiveType, SchemaType);

PrimitiveType.prototype.coerceValue = function(value) {
  // No coersion
  this.validateValue(value);
  return value;
};

module.exports = PrimitiveType;
