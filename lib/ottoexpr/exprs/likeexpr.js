'use strict';

var util = require('util');
var Expression = require('./expression');

/**
 *
 * @param {ottoexpr.Expression} left
 * @param {string} matchString
 * @constructor
 * @augments ottoexpr.Expression
 * @memberof ottoexpr
 */
function LikeExpr(left, matchString) {
  Expression.call(this);

  /**
   * @type {ottoexpr.Expression}
   * @readonly
   */
  this.left = left;

  /**
   * @type {string}
   * @readonly
   */
  this.matchString = matchString;
}
util.inherits(LikeExpr, Expression);

LikeExpr.prototype.inspect = function(depth, options) {
  return Expression._inspectGen(depth, options, 'LikeExpr',
    [this.left, this.matchString]);
};

module.exports = LikeExpr;
