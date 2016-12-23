'use strict';

var util = require('util');
var Expression = require('./expression');

/**
 *
 * @param {Expression} left
 * @param {string} matchString
 * @constructor
 * @augments Expression
 */
function LikeExpr(left, matchString) {
  Expression.call(this);

  /**
   * @type {Expression}
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

module.exports = LikeExpr;
