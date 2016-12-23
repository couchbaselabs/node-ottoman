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
function AndExpr(left, right) {
  BinaryExpr.call(this, left, right);
}
util.inherits(AndExpr, BinaryExpr);

module.exports = AndExpr;
