'use strict';

var util = require('util');
var Expression = require('./expression');

/**
 *
 * @param {ottopath.Path} path
 * @constructor
 * @augments ottoexpr.Expression
 * @memberof ottoexpr
 */
function PathExpr(path) {
  Expression.call(this);

  /**
   * @type {ottopath.Path}
   * @readonly
   */
  this.path = path;
}
util.inherits(PathExpr, Expression);

PathExpr.prototype.inspect = function() {
  return 'PathExpr(`' + this.path.toString() + '`)';
};

module.exports = PathExpr;
