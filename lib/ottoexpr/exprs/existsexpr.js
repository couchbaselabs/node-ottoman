'use strict';

var util = require('util');
var Expression = require('./expression');
var UnaryExpr = require('./unaryexpr');

/**
 *
 * @param {Expression} expression
 * @constructor
 * @augments ottoexpr.UnaryExpr
 * @memberof ottoexpr
 */
function ExistsExpr(expression) {
  UnaryExpr.call(this, expression);
}
util.inherits(ExistsExpr, UnaryExpr);

ExistsExpr.prototype.inspect = function(depth, options) {
  return Expression._inspectGen(depth, options, 'ExistsExpr',
    [this.expression]);
};

module.exports = ExistsExpr;
