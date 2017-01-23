'use strict';

var util = require('util');
var BinaryExpr = require('./binaryexpr');
var Expression = require('./expression');

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

EqualsExpr.prototype.inspect = function(depth, options) {
  return Expression._inspectGen(depth, options, 'EqualsExpr',
    [this.left, this.right]);
};

module.exports = EqualsExpr;
