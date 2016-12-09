'use strict';

var util = require('util');
var PrimitiveType = require('./primitivetype');

/**
 *
 * @constructor
 * @augments PrimitiveType
 */
function BooleanType() {
  PrimitiveType.call(this);
}
util.inherits(BooleanType, PrimitiveType);

BooleanType.prototype.validateValue = function(value) {
  if (typeof value !== 'boolean') {
    throw new TypeError('expected a boolean type');
  }
};

module.exports = BooleanType;
