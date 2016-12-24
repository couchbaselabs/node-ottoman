'use strict';

var util = require('util');
var AndExpr = require('./../../querying/exprs/andexpr');
var ContainsExpr = require('./../../querying/exprs/containsexpr');
var EqualsExpr = require('./../../querying/exprs/equalsexpr');
var Expression = require('./../../querying/exprs/expression');
var ExistsExpr = require('./../../querying/exprs/existsexpr');
var GreaterExpr = require('./../../querying/exprs/greaterexpr');
var GreaterEqualsExpr = require('./../../querying/exprs/greaterequalsexpr');
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
N1qlExprGen.prototype._processAnd = function(expression) {
  var allExprs = expression.gatherExpressions();

  var exprStrs = [];
  for (var i = 0; i < allExprs.length; ++i) {
    exprStrs.push(this._process(allExprs[i]));
  }
  return '(' + exprStrs.join(' AND ') + ')';
};

/**
 *
 * @param {ContainsExpr} expression
 * @private
 */
N1qlExprGen.prototype._processContains = function(expression) {
  return 'ANY ' + expression.key + ' IN ' + this._process(expression.haystack) +
    ' SATISFIES ' + this._process(expression.needle) + ' END';
};

/**
 *
 * @param {EqualsExpr} expression
 * @param {boolean} isnotted
 * @private
 */
N1qlExprGen.prototype._processEquals = function(expression, isnotted) {
  if (!isnotted) {
    return this._process(expression.left) +
      '=' + this._process(expression.right);
  } else {
    return this._process(expression.left) +
      '!=' + this._process(expression.right);
  }
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
 * @param {GreaterExpr} expression
 * @param {boolean} isnotted
 * @private
 */
N1qlExprGen.prototype._processGreater = function(expression, isnotted) {
  if (!isnotted) {
    return this._process(expression.left) +
      '>' + this._process(expression.right);
  } else {
    return this._process(expression.left) +
      '<=' + this._process(expression.right);
  }
};

/**
 *
 * @param {GreaterEqualsExpr} expression
 * @param {boolean} isnotted
 * @private
 */
N1qlExprGen.prototype._processGreaterEquals = function(expression, isnotted) {
  if (!isnotted) {
    return this._process(expression.left) +
      '>=' + this._process(expression.right);
  } else {
    return this._process(expression.left) +
      '<' + this._process(expression.right);
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
  if (subExpr instanceof EqualsExpr) {
    return this._processEquals(subExpr, true);
  } else if (subExpr instanceof ExistsExpr) {
    return this._processExists(subExpr, true);
  } else if (subExpr instanceof GreaterExpr) {
    return this._processGreater(subExpr, true);
  } else if (subExpr instanceof GreaterEqualsExpr) {
    return this._processGreaterEquals(subExpr, true);
  } else if (subExpr instanceof IsValuedExpr) {
    return this._processIsValued(subExpr, true);
  }

  return 'NOT ' + this._process(expression.expression);
};

/**
 *
 * @param {OrExpr} expression
 * @private
 */
N1qlExprGen.prototype._processOr = function(expression) {
  var allExprs = expression.gatherExpressions();

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

/**
 *
 * @param {Expression} expression
 * @returns {string}
 * @private
 */
N1qlExprGen.prototype._process = function(expression) {
  if (expression instanceof AndExpr) {
    return this._processAnd(expression);
  } else if (expression instanceof ContainsExpr) {
    return this._processContains(expression);
  } else if (expression instanceof EqualsExpr) {
    return this._processEquals(expression, false);
  } else if (expression instanceof ExistsExpr) {
    return this._processExists(expression, false);
  } else if (expression instanceof GreaterExpr) {
    return this._processGreater(expression, false);
  } else if (expression instanceof GreaterEqualsExpr) {
    return this._processGreaterEquals(expression, false);
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
  } else if (expression instanceof Expression) {
    throw new TypeError('unexpected expression object type');
  } else if (typeof expression === 'string') {
    return '"' + expression + '"';
  } else if (typeof expression === 'number') {
    return expression.toString();
  } else if (expression instanceof Object) {
    return JSON.stringify(expression);
  } else {
    throw new TypeError('unexpected expression object type');
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
  e: {
    '$not': {
      f: {
        '$like': 'world'
      }
    }
  },
  f: {
    '$contains': {
      g: { '$ne': 1 }
    }
  },
  h: {
    '$eq': { i: 1, j: 2 }
  }
});

console.log(util.inspect(q, {depth: 1000, simplify: true}));

var gen = new N1qlExprGen();
console.log(gen.process(q));
