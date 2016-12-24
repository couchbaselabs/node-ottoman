'use strict';

var util = require('util');
var Expression = require('./expression');
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

IsValuedExpr.prototype.inspect = function(depth, options) {
  return Expression._inspectGen(depth, options, 'IsValuedExpr',
    [this.expression]);
};

module.exports = IsValuedExpr;
