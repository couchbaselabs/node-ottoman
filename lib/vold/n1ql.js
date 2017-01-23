'use strict';

var util = require('util');

function ExpressionBase() {
}

/**
 * @param {string} name
 * @param {Expression} subexpr
 * @constructor
 */
function NamedExpression(name, subexpr) {
  ExpressionBase.call(this);

  this.name = name;
  this.subexpr = subexpr;
}
util.inherits(NamedExpression, ExpressionBase);

NamedExpression.prototype.toString = function() {
  return this.subexpr.toString() + ' AS `' + this.name + '`';
};


/**
 * @param {Expression} expr
 * @param {"ASC"|"DESC"} [direction]
 * @constructor
 */
function OrderingExpression(expr, direction) {
  ExpressionBase.call(this);

  this.expr = expr;
  this.direction = direction;
}
util.inherits(OrderingExpression, ExpressionBase);

OrderingExpression.prototype.toString = function() {
  if (this.direction !== undefined) {
    return this.expr.toString() + ' ' + this.direction;
  } else {
    return this.expr.toString();
  }
};


/**
 * @constructor
 */
function Expression() {
  ExpressionBase.call(this);
}
util.inherits(Expression, ExpressionBase);

Expression.prototype.as = function(name) {
  return new NamedExpression(name, this);
};

Expression.prototype.asc = function() {
  return new OrderingExpression(this, 'ASC');
};

Expression.prototype.desc = function() {
  return new OrderingExpression(this, 'DESC');
};




function _makeExpr(value) {
  if (value instanceof ExpressionBase) {
    return value;
  }

  return new Value(value);
}

/**
 * @param {Expression} left
 * @param {string} op
 * @param {Expression} right
 * @constructor
 */
function BinaryExpr(left, op, right) {
  Expression.call(this);

  this.left = _makeExpr(left);
  this.op = op;
  this.right = _makeExpr(right);
}
util.inherits(BinaryExpr, Expression);

BinaryExpr.prototype.toString = function() {
  return this.left.toString() + this.op + this.right.toString();
};

function UnaryPreExpr(op, expr) {
  Expression.call(this);

  this.op = op;
  this.expr = _makeExpr(expr);
}
util.inherits(UnaryPreExpr, Expression);

UnaryPreExpr.prototype.toString = function() {
  return this.op + ' ' + this.expr.toString();
};


function UnaryPostExpr(expr, op) {
  Expression.call(this);

  this.expr = _makeExpr(expr);
  this.op = op;
}
util.inherits(UnaryPostExpr, Expression);

UnaryPostExpr.prototype.toString = function() {
  return this.expr.toString() + ' ' + this.op;
};


/**
 * @param {Expression} expr
 * @returns {BinaryExpr}
 */
Expression.prototype.eq = function(expr) {
  return new BinaryExpr(this, '=', expr);
};

Expression.prototype.gt = function(expr) {
  return new BinaryExpr(this, '>', expr);
};

Expression.prototype.lt = function(expr) {
  return new BinaryExpr(this, '<', expr);
};

Expression.prototype.gte = function(expr) {
  return new BinaryExpr(this, '>=', expr);
};

Expression.prototype.lte = function(expr) {
  return new BinaryExpr(this, '<=', expr);
};

Expression.prototype.isMissing = function() {
  return new UnaryPostExpr(this, 'IS MISSING')
};

Expression.prototype.isNotMissing = function() {
  return new UnaryPostExpr(this, 'IS NOT MISSING');
};

function Identifier() {
  Expression.call(this);

  this.path = [];
}
util.inherits(Identifier, Expression);

Identifier.prototype.clone = function() {
  var cloned = new Identifier();
  for (var i in this) {
    if (this.hasOwnProperty(i)) {
      cloned[i] = this[i];
    }
  }
  return cloned;
};

Identifier.prototype.i = function(name) {
  var cloned = this.clone();
  cloned.path.push(name);
  return cloned;
};

Identifier.prototype.toString = function() {
  return '`' + this.path.join('`.`') + '`';
};


function Parameter(name) {
  Expression.call(this);

  this.name = name;
}
util.inherits(Parameter, Expression);

Parameter.prototype.toString = function() {
  return '$' + this.name;
};


function Value(value) {
  Expression.call(this);

  this.value = value;
}
util.inherits(Value, Expression);

Value.prototype.toString = function() {
  return JSON.stringify(this.value);
};


function FuncExpr(name) {
  Expression.call(this);

  this.name = name;
  this.args = [];
  for (var i = 1; i < arguments.length; ++i) {
    this.args.push(arguments[i]);
  }
}
util.inherits(FuncExpr, Expression);

FuncExpr.prototype.toString = function() {
  var args = [];
  for (var i = 0; i < this.args.length; ++i) {
    args.push(this.args[i].toString());
  }
  return this.name + '(' + args.join(',') + ')';
};


function NotExpr(subexpr) {
  Expression.call(this);

  this.subexpr = subexpr;
}
util.inherits(NotExpr, Expression);

NotExpr.prototype.toString = function() {
  return 'NOT ' + this.subexpr.toString();
};


function AndExpr() {
  Expression.call(this);

  this.subexprs = [];
}
util.inherits(AndExpr, Expression);

AndExpr.prototype.clone = function() {
  var cloned = new AndExpr();
  for (var i in this) {
    if (this.hasOwnProperty(i)) {
      cloned[i] = this[i];
    }
  }
  return cloned;
};

AndExpr.prototype.and = function() {
  var cloned = this.clone();
  for (var i = 0; i < arguments.length; ++i) {
    cloned.subexprs.push(arguments[i]);
  }
  return cloned;
};

AndExpr.prototype.toString = function() {
  var subexprs = [];
  for (var i = 0; i < this.subexprs.length; ++i) {
    subexprs.push(this.subexprs[i].toString());
  }
  return '(' + subexprs.join(' AND ') + ')';
};


function OrExpr() {
  this.subexprs = [];
}
util.inherits(OrExpr, Expression);

OrExpr.prototype.clone = function() {
  var cloned = new OrExpr();
  for (var i in this) {
    if (this.hasOwnProperty(i)) {
      cloned[i] = this[i];
    }
  }
  return cloned;
};

OrExpr.prototype.or = function() {
  var cloned = this.clone();
  for (var i = 0; i < arguments.length; ++i) {
    cloned.subexprs.push(arguments[i]);
  }
  return cloned;
};

OrExpr.prototype.toString = function() {
  var subexprs = [];
  for (var i = 0; i < this.subexprs.length; ++i) {
    subexprs.push(this.subexprs[i].toString());
  }
  return '(' + subexprs.join(' OR ') + ')';
};


/**
 * @constructor
 */
function SelectStmt() {
  this.selectExprs = [];
  this.whereExpr = undefined;
  this.fromExpr = undefined;
  this.skipCnt = undefined;
  this.limitCnt = undefined;
  this.orderByExprs = [];
  this.groupByExprs = [];
}

SelectStmt.prototype.clone = function() {
  var newClone = new SelectStmt();
  for (var i in this) {
    if (this.hasOwnProperty(i)) {
      newClone[i] = this[i];
    }
  }
  return newClone;
};

/**
 * @param {...(Expression|NamedExpression)} expressions
 */
SelectStmt.prototype.select = function() {
  // assert.eachTypeOf(arguments, [RvalueReference, NamedReference]);

  var cloned = this.clone();
  for (var i = 0; i < arguments.length; ++i) {
    cloned.selectExprs.push(arguments[i]);
  }
  return cloned;
};

SelectStmt.prototype.from = function(expression) {
  if (this.fromExpr !== undefined) {
    throw new Error('cannot specify multiple from clauses');
  }

  var cloned = this.clone();
  cloned.fromExpr = expression;
  return cloned;
};

SelectStmt.prototype.innerJoin = function(expr, keysExpr) {
  var cloned = this.clone();
  // TODO: Do this!
  console.error('NOT SUPPORTED');
  return cloned;
};

/**
 * @param {Expression} expression
 */
SelectStmt.prototype.where = function(expression) {
  // assert.typeOf(expr, Expression);

  if (this.whereExpr !== undefined) {
    throw new Error('cannot specify multiple where clauses');
  }

  var cloned = this.clone();
  cloned.whereExpr = expression;
  return cloned;
};

/**
 * @param {...(Expression|OrderingExpression)} expressions
 */
SelectStmt.prototype.orderBy = function() {
  // assert.eachTypeOf(arguments, [RvalueExpresion, OrderingExpression]);

  var cloned = this.clone();
  for (var i = 0; i < arguments.length; ++i) {
    cloned.orderByExprs.push(arguments[i]);
  }
  return cloned;
};

/**
 * @param {...Expression} expressions
 */
SelectStmt.prototype.groupBy = function() {
  // assert.typeOf(expr, [Expression]);

  var cloned = this.clone();
  for (var i = 0; i < arguments.length; ++i) {
    cloned.groupByExprs.push(arguments[i]);
  }
  return cloned;
};

/**
 * @param {number} value
 */
SelectStmt.prototype.skip = function(value) {
  // assert.isInteger(value);

  var cloned = this.clone();
  cloned.skipCnt = value;
  return cloned;
};

/**
 * @param {number} value
 */
SelectStmt.prototype.limit = function(value) {
  // assert.isInteger(value);

  var cloned = this.clone();
  cloned.limitCnt = value;
  return cloned;
};

SelectStmt.prototype.toString = function() {
  if (this.selectExprs.length === 0) {
    throw new Error('must specify at least one selected expression');
  }

  var clauses = [];

  var selectStrs = [];
  for (var i = 0; i < this.selectExprs.length; ++i) {
    selectStrs.push(this.selectExprs[i].toString());
  }
  clauses.push('SELECT ' + selectStrs.join(','));

  if (this.fromExpr !== undefined) {
    clauses.push('FROM ' + this.fromExpr.toString());
  }

  if (this.whereExpr !== undefined) {
    clauses.push('WHERE ' + this.whereExpr.toString());
  }

  if (this.orderByExprs.length > 0) {
    var orderByStrs = [];
    for (var i = 0; i < this.orderByExprs.length; ++i) {
      orderByStrs.push(this.orderByExprs[i].toString());
    }
    clauses.push('ORDER BY ' + orderByStrs.join(','));
  }

  if (this.groupByExprs.length > 0) {
    var groupByStrs = [];
    for (var i = 0; i < this.groupByExprs.length; ++i) {
      groupByStrs.push(this.groupByExprs[i].toString());
    }
    clauses.push('GROUP BY ' + groupByStrs.join(','));
  }

  if (this.skipCnt !== undefined) {
    clauses.push('SKIP ' + this.skipCnt);
  }

  if (this.limitCnt !== undefined) {
    clauses.push('LIMIT ' + this.limitCnt);
  }

  return clauses.join(' ');
};

/**
 * @param {...string}
 * @returns {Identifier}
 */
module.exports.i = function() {
  return Identifier.prototype.i.apply(new Identifier(), arguments);
};

/**
 * @param {*} value
 * @returns {Value}
 */
module.exports.v = function(value) {
  return new Value(value);
};

/**
 * @param name
 * @returns {Parameter}
 */
module.exports.p = function(name) {
  return new Parameter(name);
};

/**
 * @param {string} name
 * @param {...Expression} parameters
 */
module.exports.f = function(name) {
  var args = Array.prototype.slice.call(arguments);
  return new (FuncExpr.bind.apply(FuncExpr, [null].concat(args)));
};

module.exports.f.DISTINCT = function(expr) {
  return module.exports.f('DISTINCT', expr);
};

module.exports.f.DATE_PART_STR = function(expr, part) {
  return module.exports.f('DATE_PART_STR', expr, part);
};

/**
 * @param {...(Expression|NamedExpression)} expressions
 * @returns {SelectStmt}
 */
module.exports.select = function() {
  return SelectStmt.prototype.select.apply(new SelectStmt(), arguments);
};

/**
 * @param {Expression} expr
 * @returns {NotExpr}
 */
module.exports.not = function(expr) {
  return new NotExpr(expr);
};

/**
 * @param {...Expression} expressions
 * @returns {AndExpr}
 */
module.exports.and = function() {
  return AndExpr.prototype.and.apply(new AndExpr(), arguments);
};

/**
 * @param {...Expression} expressions
 * @returns {OrExpr}
 */
module.exports.or = function() {
  return OrExpr.prototype.or.apply(new OrExpr(), arguments);
};
