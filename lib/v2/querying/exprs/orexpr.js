'use strict';

var util = require('util');
var BinaryExpr = require('./binaryexpr');

/**
 *
 * @param {Expression} left
 * @param {Expression} right
 * @constructor
 * @augments BinaryExpr
 */
function OrExpr(left, right) {
  BinaryExpr.call(this, left, right);
}
util.inherits(OrExpr, BinaryExpr);

module.exports = OrExpr;
