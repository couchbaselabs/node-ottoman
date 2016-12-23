'use strict';

var util = require('util');
var UnaryExpr = require('./unaryexpr');

/**
 *
 * @param {Expression} expression
 * @constructor
 * @augments Expression
 */
function IsValuedExpr(expression) {
  UnaryExpr.call(this, expression);
}
util.inherits(IsValuedExpr, UnaryExpr);

module.exports = IsValuedExpr;
