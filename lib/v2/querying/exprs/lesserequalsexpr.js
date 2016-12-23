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
function LesserEqualsExpr(left, right) {
  BinaryExpr.call(this, left, right);
}
util.inherits(LesserEqualsExpr, BinaryExpr);

module.exports = LesserEqualsExpr;
