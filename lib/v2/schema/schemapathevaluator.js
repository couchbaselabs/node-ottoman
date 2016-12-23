'use strict';

var util = require('util');
var PathEvaluator = require('./pathevaluator');
var ListType = require('./types/listtype');

/**
 *
 * @param options
 * @constructor
 * @augments PathEvaluator
 */
function SchemaPathEvaluator(options) {
  PathEvaluator.call(this);

  /** @type {boolean} */
  this.singleOnly = true;

  if (options.hasOwnProperty('singleOnly')) {
    this.singleOnly = !!options['singleOnly'];
  }
}
util.inherits(SchemaPathEvaluator, PathEvaluator);

/**
 *
 * @param {*} value
 * @param {string} identifier
 * @returns {*}
 * @override
 */
SchemaPathEvaluator.prototype.member = function(value, identifier) {
  return value[identifier];
};

/**
 *
 * @param {*} value
 * @param {string|number} key
 * @returns {*}
 * @override
 */
SchemaPathEvaluator.prototype.subscript = function(value, key) {
  return value[key];
};

/**
 *
 * @param {*} value
 * @returns {*}
 * @override
 */
SchemaPathEvaluator.prototype.wildSubscript = function(value) {
  if (this.singleOnly) {
    return [];
  }

  if (!(value instanceof ListType)) {
    return [];
  }

  /** @type {ListType} */
  var listValue = value;

  return [listValue.itemType];
};

module.exports = SchemaPathEvaluator;
