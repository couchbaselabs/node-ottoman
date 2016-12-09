'use strict';

var util = require('util');

function OttoArray(itemType) {
  Array.call(this);

  /** @type SchemaType */
  this.itemType = itemType;
}
util.inherits(OttoArray, Array);

OttoArray.prototype.push = function() {
  for (var i = 0; i < arguments.length; ++i) {
    this.itemType.validateValue(arguments[i]);
  }
  return Array.push.apply(this, arguments);
};

OttoArray.prototype.unshift = function() {
  for (var i = 0; i < arguments.length; ++i) {
    this.itemType.validateValue(arguments[i]);
  }
  return Array.unshift.apply(this, arguments);
};

module.exports = OttoArray;
