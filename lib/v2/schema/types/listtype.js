'use strict';

var util = require('util');
var SchemaType = require('./schematype');
var OttoArray = require('../ottoarray');

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

ListType.prototype.validateValue = function(value) {
  if (!(value instanceof OttoArray)) {
    throw new Error('expected OttomanArray type');
  }

  if (value.itemType !== this.itemType) {
    throw new Error('expected OttomanArray with correct item type');
  }
};

module.exports = ListType;
