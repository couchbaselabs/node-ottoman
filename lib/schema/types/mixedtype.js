'use strict';

var util = require('util');
var PrimitiveType = require('./primitivetype');

/**
 *
 * @constructor
 * @augments PrimitiveType
 */
function MixedType() {
  PrimitiveType.call(this);
}
util.inherits(MixedType, PrimitiveType);

MixedType.prototype.validateValue = function() {
  // All types are allowed
};

module.exports = MixedType;
