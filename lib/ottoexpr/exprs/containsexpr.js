'use strict';

var util = require('util');
var Expression = require('./expression');

/**
 *
 * @Param {string} key
 * @param {ottoexpr.Expression} haystack
 * @param {ottoexpr.Expression} needle
 * @constructor
 * @augments ottoexpr.Expression
 * @memberof ottoexpr
 */
function ContainsExpr(key, haystack, needle) {
  Expression.call(this);

  /**
   * @type {string}
   * @readonly
   */
  this.key = key;

  /**
   * @type {ottoexpr.Expression}
   * @readonly
   */
  this.haystack = haystack;

  /**
   * @type {ottoexpr.Expression}
   * @readonly
   */
  this.needle = needle;
}
util.inherits(ContainsExpr, Expression);

ContainsExpr.prototype.inspect = function(depth, options) {
  return Expression._inspectGen(depth, options, 'ContainsExpr',
    [this.key, this.haystack, this.needle]);
};

module.exports = ContainsExpr;
