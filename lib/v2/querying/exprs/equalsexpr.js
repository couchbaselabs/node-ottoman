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
function EqualsExpr(left, right) {
  BinaryExpr.call(this, left, right);
}
util.inherits(EqualsExpr, BinaryExpr);

module.exports = EqualsExpr;
