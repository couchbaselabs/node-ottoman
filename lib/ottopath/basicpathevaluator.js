'use strict';

var util = require('util');
var PathEvaluator = require('./pathevaluator');

/**
 *
 * @constructor
 * @augments ottopath.PathEvaluator
 * @memberof ottopath
 */
function BasicPathEvaluator() {
  PathEvaluator.call(this);
}
util.inherits(BasicPathEvaluator, PathEvaluator);

/**
 *
 * @param {*} value
 * @param {string} identifier
 * @returns {Array}
 * @override
 */
BasicPathEvaluator.prototype.member = function(value, identifier) {
  return [value[identifier]];
};

/**
 *
 * @param {*} value
 * @param {string|number} key
 * @returns {Array}
 * @override
 */
BasicPathEvaluator.prototype.subscript = function(value, key) {
  return [value[key]];
};

/**
 *
 * @param {*} value
 * @returns {Array}
 * @override
 */
BasicPathEvaluator.prototype.wildSubscript = function(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  var newValues = [];
  for (var i = 0; i < value.length; ++i) {
    newValues.push(value[i]);
  }
  return newValues;
};

module.exports = BasicPathEvaluator;
