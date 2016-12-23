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
function GreaterEqualsExpr(left, right) {
  BinaryExpr.call(this, left, right);
}
util.inherits(GreaterEqualsExpr, BinaryExpr);

module.exports = GreaterEqualsExpr;
