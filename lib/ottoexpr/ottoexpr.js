'use strict';

// TODO: Improve ottoexpr namespace description
/**
 * ottoexpr provides interfaces to parse expression descriptions, and then
 * perform various operations against the generated expression tree.
 *
 * @namespace ottoexpr
 * */

var util = require('util');
var ExprDescParser = require('./exprdescparser');

/**
 *
 * @param desc
 * @returns {?ottoexpr.Expression}
 * @memberof ottoexpr
 */
function parse(desc) {
  return (new ExprDescParser()).parse(desc);
}
exports.parse = parse;

exports.AndExpr = require('./exprs/andexpr');
exports.BinaryExpr = require('./exprs/binaryexpr');
exports.ContainsExpr = require('./exprs/containsexpr');
exports.ExistsExpr = require('./../../ottoexpr/exprs/existsexpr');
exports.EqualsExpr = require('./exprs/equalsexpr');
exports.Expression = require('./ottoexpr/exprs/expression');
exports.GreaterEqualsExpr = require('./ottoexpr/exprs/greaterequalsexpr');
exports.GreaterExpr = require('./ottoexpr/exprs/greaterexpr');
exports.IsValuedExpr = require('./ottoexpr/exprs/isvaluedexpr');
exports.LikeExpr = require('./ottoexpr/exprs/likeexpr');
exports.NotExpr = require('./ottoexpr/exprs/notexpr');
exports.OrExpr = require('./ottoexpr/exprs/orexpr');
exports.PathExpr = require('./ottoexpr/exprs/pathexpr');
exports.UnaryExpr = require('./exprs/unaryexpr');
