'use strict';

var util = require('util');
var Expression = require('./expression');

/**
 *
 * @param {Expression} expression
 * @constructor
 * @augments Expression
 */
function UnaryExpr(expression) {
  Expression.call(this);

  /**
   * @type {Expression}
   * @readonly
   */
  this.expression = expression;
}
util.inherits(UnaryExpr, Expression);

module.exports = UnaryExpr;
