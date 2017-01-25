'use strict';

var util = require('util');
var PrimitiveType = require('./primitivetype');

/**
 *
 * @constructor
 * @augments PrimitiveType
 */
function StringType() {
  PrimitiveType.call(this);
}
util.inherits(StringType, PrimitiveType);

StringType.prototype.coerceValue = function(value) {
  return value.toString();
};

StringType.prototype.validateValue = function(value) {
  if (typeof value !== 'string') {
    throw new TypeError('expected a string type');
  }
};

module.exports = StringType;
