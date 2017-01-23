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

module.exports = PrimitiveType;
