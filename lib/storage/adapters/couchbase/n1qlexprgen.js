'use strict';

var util = require('util');
var ottoexpr = require('./../../ottoexpr/ottoexpr');

/**
 *
 * @constructor
 */
function N1qlExprGen() {

}

/**
 *
 * @param {ottoexpr.AndExpr} expression
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
 * @param {ottoexpr.ContainsExpr} expression
 * @private
 */
N1qlExprGen.prototype._processContains = function(expression) {
  return 'ANY ' + expression.key + ' IN ' + this._process(expression.haystack) +
    ' SATISFIES ' + this._process(expression.needle) + ' END';
};

/**
 *
 * @param {ottoexpr.EqualsExpr} expression
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
 * @param {ottoexpr.ExistsExpr} expression
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
 * @param {ottoexpr.GreaterExpr} expression
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
 * @param {ottoexpr.GreaterEqualsExpr} expression
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
 * @param {ottoexpr.IsValuedExpr} expression
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
 * @param {ottoexpr.LikeExpr} expression
 * @private
 */
N1qlExprGen.prototype._processLike = function(expression) {
  return this._process(expression.left) + ' LIKE "' +
    expression.matchString + '"';
};

/**
 *
 * @param {ottoexpr.NotExpr} expression
 * @private
 */
N1qlExprGen.prototype._processNot = function(expression) {
  // We special-case these particular ones for more logical statements
  var subExpr = expression.expression;
  if (subExpr instanceof ottoexpr.EqualsExpr) {
    return this._processEquals(subExpr, true);
  } else if (subExpr instanceof ottoexpr.ExistsExpr) {
    return this._processExists(subExpr, true);
  } else if (subExpr instanceof ottoexpr.GreaterExpr) {
    return this._processGreater(subExpr, true);
  } else if (subExpr instanceof ottoexpr.GreaterEqualsExpr) {
    return this._processGreaterEquals(subExpr, true);
  } else if (subExpr instanceof ottoexpr.IsValuedExpr) {
    return this._processIsValued(subExpr, true);
  }

  return 'NOT ' + this._process(expression.expression);
};

/**
 *
 * @param {ottoexpr.OrExpr} expression
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
 * @param {ottoexpr.PathExpr} expression
 * @private
 */
N1qlExprGen.prototype._processPath = function(expression) {
  return expression.path.toString();
};

/**
 *
 * @param {ottoexpr.Expression} expression
 * @returns {string}
 * @private
 */
N1qlExprGen.prototype._process = function(expression) {
  if (!expression) {
    return '';
  }

  if (expression instanceof ottoexpr.AndExpr) {
    return this._processAnd(expression);
  } else if (expression instanceof ottoexpr.ContainsExpr) {
    return this._processContains(expression);
  } else if (expression instanceof ottoexpr.EqualsExpr) {
    return this._processEquals(expression, false);
  } else if (expression instanceof ottoexpr.ExistsExpr) {
    return this._processExists(expression, false);
  } else if (expression instanceof ottoexpr.GreaterExpr) {
    return this._processGreater(expression, false);
  } else if (expression instanceof ottoexpr.GreaterEqualsExpr) {
    return this._processGreaterEquals(expression, false);
  } else if (expression instanceof ottoexpr.IsValuedExpr) {
    return this._processIsValued(expression, false);
  } else if (expression instanceof ottoexpr.LikeExpr) {
    return this._processLike(expression);
  } else if (expression instanceof ottoexpr.NotExpr) {
    return this._processNot(expression);
  } else if (expression instanceof ottoexpr.OrExpr) {
    return this._processOr(expression);
  } else if (expression instanceof ottoexpr.PathExpr) {
    return this._processPath(expression);
  } else if (expression instanceof ottoexpr.Expression) {
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

/**
 *
 * @param {ottoexpr.Expression} expression
 * @returns {string}
 */
N1qlExprGen.prototype.process = function(expression) {
  return this._process(expression);
};

module.exports = N1qlExprGen;
