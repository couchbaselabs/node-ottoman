'use strict';

var util = require('util');
var SchemaType = require('./schematype');

/**
 *
 * @constructor
 * @augments SchemaType
 */
function DateType() {
  SchemaType.call(this);
}
util.inherits(DateType, SchemaType);

DateType.prototype.validateValue = function(value) {
  if (!(value instanceof Date)) {
    throw new TypeError('expected a Date object');
  }
};

module.exports = DateType;
