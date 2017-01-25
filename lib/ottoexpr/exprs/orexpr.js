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
function OrExpr(left, right) {
  BinaryExpr.call(this, left, right);
}
util.inherits(OrExpr, BinaryExpr);

/**
 * Performs a gather from a tree of OrExpr's into a left-to-right list
 *  of expressions which are OR'd together.
 *
 * @returns {ottoexpr.Expression[]}
 */
OrExpr.prototype.gatherExpressions = function() {
  var gathered = [];

  if (this.left instanceof OrExpr) {
    gathered = gathered.concat(this.left.gatherExpressions());
  } else {
    gathered.push(this.left);
  }

  if (this.right instanceof OrExpr) {
    gathered = gathered.concat(this.right.gatherExpressions());
  } else {
    gathered.push(this.right);
  }

  return gathered;
};

OrExpr.prototype.inspect = function(depth, options) {
  var gathered = [this.left, this.right];
  if (!!options['simplify']) {
    gathered = this.gatherExpressions();
  }

  return Expression._inspectGen(depth,  options, 'OrExpr', gathered);
};

module.exports = OrExpr;
