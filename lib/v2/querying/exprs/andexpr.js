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
function AndExpr(left, right) {
  BinaryExpr.call(this, left, right);
}
util.inherits(AndExpr, BinaryExpr);

/**
 * Performs a gather from a tree of AndExpr's into a left-to-right list
 *  of expressions which are AND'd together.
 *
 * @returns {Expression[]}
 */
AndExpr.prototype.gatherExpressions = function() {
  var gathered = [];

  if (this.left instanceof AndExpr) {
    gathered = gathered.concat(this.left.gatherExpressions());
  } else {
    gathered.push(this.left);
  }

  if (this.right instanceof AndExpr) {
    gathered = gathered.concat(this.right.gatherExpressions());
  } else {
    gathered.push(this.right);
  }

  return gathered;
};

AndExpr.prototype.inspect = function(depth, options) {
  var gathered = [this.left, this.right];
  if (!!options['simplify']) {
    gathered = this.gatherExpressions();
  }

  return Expression._inspectGen(depth,  options, 'AndExpr', gathered);
};

module.exports = AndExpr;
