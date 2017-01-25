'use strict';

var util = require('util');
var Expression = require('./expression');

/**
 *
 * @param {ottoexpr.Expression} left
 * @param {ottoexpr.Expression} right
 * @constructor
 * @augments ottoexpr.Expression
 * @memberof ottoexpr
 */
function BinaryExpr(left, right) {
  Expression.call(this);

  /**
   * @type {ottoexpr.Expression}
   * @readonly
   */
  this.left = left;

  /**
   * @type {ottoexpr.Expression}
   * @readonly
   */
  this.right = right;
}
util.inherits(BinaryExpr, Expression);

module.exports = BinaryExpr;
