'use strict';

var util = require('util');
var Expression = require('./expression');

/**
 *
 * @param {OttoPath} path
 * @constructor
 * @augments Expression
 */
function PathExpr(path) {
  Expression.call(this);

  /**
   * @type {OttoPath}
   * @readonly
   */
  this.path = path;
}
util.inherits(PathExpr, Expression);

module.exports = PathExpr;
