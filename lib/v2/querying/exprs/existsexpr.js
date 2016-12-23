'use strict';

var util = require('util');
var UnaryExpr = require('./unaryexpr');

/**
 *
 * @param {Expression} expression
 * @constructor
 * @augments Expression
 */
function ExistsExpr(expression) {
  UnaryExpr.call(this, expression);
}
util.inherits(ExistsExpr, UnaryExpr);

module.exports = ExistsExpr;
