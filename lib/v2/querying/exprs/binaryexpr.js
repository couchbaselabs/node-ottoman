'use strict';

var util = require('util');
var Expression = require('./expression');

/**
 *
 * @param {Expression} left
 * @param {Expression} right
 * @constructor
 * @augments Expression
 */
function BinaryExpr(left, right) {
  Expression.call(this);

  /**
   * @type {Expression}
   * @readonly
   */
  this.left = left;

  /**
   * @type {Expression}
   * @readonly
   */
  this.right = right;
}
util.inherits(BinaryExpr, Expression);

module.exports = BinaryExpr;
