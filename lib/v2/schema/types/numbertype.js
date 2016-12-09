'use strict';

var util = require('util');
var PrimitiveType = require('./primitivetype');

/**
 *
 * @constructor
 * @augments PrimitiveType
 */
function NumberType() {
  PrimitiveType.call(this);
}
util.inherits(NumberType, PrimitiveType);

NumberType.prototype.validateValue = function(value) {
  if (typeof value !== 'number') {
    throw new TypeError('expected a numeric type');
  }
};

module.exports = NumberType;
