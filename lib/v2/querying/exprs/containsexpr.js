'use strict';

var util = require('util');
var Expression = require('./expression');

/**
 *
 * @param {Expression} haystack
 * @param {Expression} needle
 * @constructor
 * @augments Expression
 */
function ContainsExpr(haystack, needle) {
  Expression.call(this);

  /**
   * @type {Expression}
   * @readonly
   */
  this.haystack = haystack;

  /**
   * @type {string}
   * @readonly
   */
  this.needle = needle;
}
util.inherits(ContainsExpr, Expression);

module.exports = ContainsExpr;
