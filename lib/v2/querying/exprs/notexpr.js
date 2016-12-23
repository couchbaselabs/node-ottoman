'use strict';

var util = require('util');
var UnaryExpr = require('./unaryexpr');

/**
 *
 * @param {Expression} expression
 * @constructor
 * @augments BinaryExpr
 */
function NotExpr(expression) {
  UnaryExpr.call(this, expression);
}
util.inherits(NotExpr, UnaryExpr);

module.exports = NotExpr;
