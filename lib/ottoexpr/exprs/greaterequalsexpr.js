'use strict';

var util = require('util');
var BinaryExpr = require('./binaryexpr');
var Expression = require('./expression');

/**
 *
 * @param {ottoexpr.Expression} left
 * @param {ottoexpr.Expression} right
 * @constructor
 * @augments ottoexpr.BinaryExpr
 * @memberof ottoexpr
 */
function GreaterEqualsExpr(left, right) {
  BinaryExpr.call(this, left, right);
}
util.inherits(GreaterEqualsExpr, BinaryExpr);

GreaterEqualsExpr.prototype.inspect = function(depth, options) {
  return Expression._inspectGen(depth, options, 'GreaterEqualsExpr',
    [this.left, this.right]);
};

module.exports = GreaterEqualsExpr;
