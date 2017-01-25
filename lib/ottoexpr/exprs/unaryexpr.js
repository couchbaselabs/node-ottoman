'use strict';

var util = require('util');
var Expression = require('./expression');

/**
 *
 * @param {ottoexpr.Expression} expression
 * @constructor
 * @augments ottoexpr.Expression
 * @memberof ottoexpr
 */
function UnaryExpr(expression) {
  Expression.call(this);

  /**
   * @type {ottoexpr.Expression}
   * @readonly
   */
  this.expression = expression;
}
util.inherits(UnaryExpr, Expression);

module.exports = UnaryExpr;
