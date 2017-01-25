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
function NotExpr(expression) {
  UnaryExpr.call(this, expression);
}
util.inherits(NotExpr, UnaryExpr);

NotExpr.prototype.inspect = function(depth, options) {
  return Expression._inspectGen(depth, options, 'NotExpr',
    [this.expression]);
};

module.exports = NotExpr;
