'use strict';

var util = require('util');
var AndExpr = require('./../../querying/exprs/andexpr');
var EqualsExpr = require('./../../querying/exprs/equalsexpr');
var ExistsExpr = require('./../../querying/exprs/existsexpr');
var IsValuedExpr = require('./../../querying/exprs/isvaluedexpr');
var LikeExpr = require('./../../querying/exprs/likeexpr');
var NotExpr = require('./../../querying/exprs/notexpr');
var OrExpr = require('./../../querying/exprs/orexpr');
var PathExpr = require('./../../querying/exprs/pathexpr');

function N1qlExprGen() {

}

/**
 *
 * @param {AndExpr} expression
 * @private
 */
N1qlExprGen.prototype._gatherAnd = function(expression) {
  var gathered = [];

  if (expression.left instanceof AndExpr) {
    gathered = gathered.concat(this._gatherAnd(expression.left));
  } else {
    gathered.push(expression.left);
  }

  if (expression.right instanceof AndExpr) {
    gathered = gathered.concat(this._gatherAnd(expression.right));
  } else {
    gathered.push(expression.right);
  }

  return gathered;
};

/**
 *
 * @param {OrExpr} expression
 * @private
 */
N1qlExprGen.prototype._gatherOr = function(expression) {
  var gathered = [];

  if (expression.left instanceof OrExpr) {
    gathered = gathered.concat(this._gatherOr(expression.left));
  } else {
    gathered.push(expression.left);
  }

  if (expression.right instanceof OrExpr) {
    gathered = gathered.concat(this._gatherOr(expression.right));
  } else {
    gathered.push(expression.right);
  }

  return gathered;
};

/**
 *
 * @param {AndExpr} expression
 * @private
 */
N1qlExprGen.prototype._processAnd = function(expression) {
  var allExprs = this._gatherAnd(expression);

  var exprStrs = [];
  for (var i = 0; i < allExprs.length; ++i) {
    exprStrs.push(this._process(allExprs[i]));
  }
  return '(' + exprStrs.join(' AND ') + ')';
};

/**
 *
 * @param {EqualsExpr} expression
 * @private
 */
N1qlExprGen.prototype._processEquals = function(expression) {
  return this._process(expression.left) + '=' + this._process(expression.right);
};

/**
 *
 * @param {ExistsExpr} expression
 * @param {boolean} isnotted
 * @private
 */
N1qlExprGen.prototype._processExists = function(expression, isnotted) {
  if (!isnotted) {
    return this._process(expression.expression) + ' IS NOT MISSING';
  } else {
    return this._process(expression.expression) + ' IS MISSING';
  }
};

/**
 *
 * @param {IsValuedExpr} expression
 * @param {boolean} isnotted
 * @private
 */
N1qlExprGen.prototype._processIsValued = function(expression, isnotted) {
  if (!isnotted) {
    return this._process(expression.expression) + ' IS VALUED';
  } else {
    return this._process(expression.expression) + ' IS NOT VALUED';
  }
};

/**
 *
 * @param {LikeExpr} expression
 * @private
 */
N1qlExprGen.prototype._processLike = function(expression) {
  return this._process(expression.left) + ' LIKE "' +
    expression.matchString + '"';
};

/**
 *
 * @param {NotExpr} expression
 * @private
 */
N1qlExprGen.prototype._processNot = function(expression) {
  // We special-case these particular ones for more logical statements
  var subExpr = expression.expression;
  if (subExpr instanceof ExistsExpr) {
    return this._processExists(subExpr, true);
  } else if (subExpr instanceof IsValuedExpr) {
    return this._processIsValued(subExpr, true);
  }

  return 'NOT ' + this._process(expression.expression);
};

/**
 *
 * @param {AndExpr} andExpr
 * @private
 */
N1qlExprGen.prototype._processOr = function(expression) {
  var allExprs = this._gatherOr(expression);

  var exprStrs = [];
  for (var i = 0; i < allExprs.length; ++i) {
    exprStrs.push(this._process(allExprs[i]));
  }
  return '(' + exprStrs.join(' OR ') + ')';
};

/**
 *
 * @param {PathExpr} expression
 * @private
 */
N1qlExprGen.prototype._processPath = function(expression) {
  return expression.path.toString();
};

N1qlExprGen.prototype._process = function(expression) {
  if (expression instanceof AndExpr) {
    return this._processAnd(expression);
  } else if (expression instanceof EqualsExpr) {
    return this._processEquals(expression);
  } else if (expression instanceof ExistsExpr) {
    return this._processExists(expression, false);
  } else if (expression instanceof IsValuedExpr) {
    return this._processIsValued(expression, false);
  } else if (expression instanceof LikeExpr) {
    return this._processLike(expression);
  } else if (expression instanceof NotExpr) {
    return this._processNot(expression);
  } else if (expression instanceof OrExpr) {
    return this._processOr(expression);
  } else if (expression instanceof PathExpr) {
    return this._processPath(expression);
  } else if (typeof expression === 'string') {
    return '"' + expression + '"';
  } else if (typeof expression === 'number') {
    return expression;
  } else {
    throw new Error('unexpected expression object type `' +
      expression.constructor.name + '`');
  }
};

// TODO: Maybe give this method a better name?
N1qlExprGen.prototype.process = function(expression) {
  return this._process(expression);
};

module.exports = N1qlExprGen;

var ExprDescParser = require('./../../querying/exprdescparser');

var p = new ExprDescParser();
var q = p.parse({
  a: 1,
  b: { '$exists': 1 },
  c: { '$like': 'hello' },
  d: { '$exists': 0 },
  e: { f: {
    '$not': {
      '$like': 'world'
    }
  }}
});

console.log(util.inspect(q, {depth: 1000}));

var gen = new N1qlExprGen();
console.log(gen.process(q));
