'use strict';

var util = require('util');
var SchemaType = require('./schematype');

/**
 *
 * @param {SchemaType} itemType
 * @constructor
 * @augments {SchemaType}
 */
function ListType(itemType) {
  SchemaType.call(this);

  /**
   * @type {SchemaType}
   * @readonly
   */
  this.itemType = itemType;
}
util.inherits(ListType, SchemaType);

function _makeOttoArr(itemType) {
  var arr = [];

  /*
  Object.defineProperty(arr, 'itemType', {
    writable: false,
    enumerable: false,
    configurable: false,
    value: itemType
  });
  */

  /*
  arr.push = function() {
    for (var i = 0; i < arguments.length; ++i) {
      itemType.validateValue(arguments[i]);
    }
    [].push.apply(this, arguments);
  };

  arr.unshift = function() {
    for (var i = 0; i < arguments.length; ++i) {
      itemType.validateValue(arguments[i]);
    }
    [].unshift.apply(this, arguments);
  };
  */

  return arr;
}

ListType.prototype.coerceValue = function(value) {
  if (Array.isArray(value)) {
    if (value.itemType === this.itemType) {
      return value;
    }

    var oArr = _makeOttoArr(this.itemType);
    for (var i = 0; i < value.length; ++i) {
      oArr.push(value[i]);
    }
    return oArr;
  } else {
    throw new TypeError('cannot coerce type to list');
  }
};

ListType.prototype.validateValue = function(value) {
  if (!Array.isArray(value)) {
    throw new TypeError('expected array');
  }

  /*
  if (value.itemType !== this.itemType) {
    //throw new TypeError('array item type does not match');
  }
  */

  for (var i = 0; i < value.length; ++i) {
    this.itemType.validateValue(value[i]);
  }
};

module.exports = ListType;
