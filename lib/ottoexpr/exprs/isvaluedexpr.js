'use strict';

var util = require('util');
var Expression = require('./expression');
var UnaryExpr = require('./unaryexpr');

/**
 *
 * @param {ottoexpr.Expression} expression
 * @constructor
 * @augments ottoexpr.UnaryExpr
 * @memberof ottoexpr
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
