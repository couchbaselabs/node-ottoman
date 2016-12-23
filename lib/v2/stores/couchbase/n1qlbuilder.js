'use strict';

/**
 *
 * @param {string} name
 * @param {"ASC"|"DESC"|undefined} direction
 * @private
 */
function _OrderField(name, direction) {
  this.name = name;
  this.direction = direction.toUpperCase();
}

/**
 * @typedef {MatchObj|string|number} MatchExpr
 */

/**
 * @typedef {Object.<string, MatchExpr>} MatchObj
 */

/**
 *
 * @constructor
 * @private
 */
function N1qlBuilder() {
  /** @type {MatchObj[]} */
  this.filterExprs = [];

  /** @type {number} */
  this.skipCount = undefined;

  /** @type {number} */
  this.limitCount = undefined;

  /** @type {_OrderField[]} */
  this.orderByFields = [];
}

/**
 *
 * @param {MatchObj} filter
 * @returns {N1qlBuilder}
 */
N1qlBuilder.prototype.filter = function(filter) {
  this.filterExprs.push(filter);

  return this;
};

/**
 *
 * @param {number} amount
 * @returns {N1qlBuilder}
 */
N1qlBuilder.prototype.skip = function(amount) {
  if (this.skipCount !== undefined) {
    this.skipCount += amount;
  } else {
    this.skipCount = amount;
  }

  if (this.limitCount !== undefined) {
    this.limitCount -= amount;
  }

  return this;
};

/**
 *
 * @param {number} amount
 * @returns {N1qlBuilder}
 */
N1qlBuilder.prototype.limit = function(amount) {
  if (this.limitCount !== undefined) {
    if (amount < this.limitCount) {
      this.limitCount = amount;
    }
  } else {
    this.limitCount = amount;
  }

  return this;
};

/**
 *
 * @param part
 * @private
 */
N1qlBuilder.prototype._addOrderPart = function(part) {
  if (Array.isArray(part)) {
    for (var i = 0; i < part.length; ++i) {
      this._addOrderPart(part[i]);
    }
    return;
  }

  if (typeof part === 'string') {
    this.orderByFields.push(new _OrderField(part));
  } else if (part instanceof Object) {
    for (var j in part) {
      if (part.hasOwnProperty(j)) {
        this.orderByFields.push(new _OrderField(j, part[j]));
      }
    }
  } else {
    throw new Error('unexpected ordering part type');
  }
};

// TODO: Improve this...
/**
 * @typedef {*} OrderFieldDesc
 */

/**
 * @param {OrderFieldDesc...} fields
 * @returns {N1qlBuilder}
 */
N1qlBuilder.prototype.sortBy = function() {
  for (var i = 0; i < arguments.length; ++i) {
    this._addOrderPart(arguments[i]);
  }

  return this;
};

/**
 * Builds a N1QL expression that will filter based on the
 *   specified Ottoman filter expression.
 *
 * @param {Object} filters
 *   The Ottoman filter expression object that we are currently parsing.
 * @param {string[]} expressions
 *   A list of expresion that have been generated so far.
 * @param {string} [root]
 *   The root path leading up to the keys specified in the filter.
 * @private
 */
function _buildFilterExprs(filters, expressions, root) {
  var SPECIAL_KEYS = ['$exists', '$missing', '$contains', '$like'];
  var BOOLEAN = ['or', 'and'];
  if (!root) {
    root = '';
  }

  for (var i in filters) {
    if (filters.hasOwnProperty(i)) {
      if (SPECIAL_KEYS.indexOf(i) !== -1) {
        continue;
      }

      var ident = root + '`' + i.split('.').join('`.`') + '`';
      if (filters[i].$exists) {
        expressions.push(ident + ' IS VALUED');
      } else if (filters[i].$missing) {
        expressions.push(ident + ' IS MISSING');
      }
      if (filters[i].$like) {
        expressions.push(ident + ' LIKE ' + '\'' + filters[i].$like + '\'');
      }
      if (filters[i].$contains) {
        var subfilters = filters[i].$contains;
        var subexprs = [];
        _buildFilterExprs(subfilters, subexprs, 'x.');
        expressions.push('ANY x IN ' + ident + ' SATISFIES ' +
          subexprs.join(' AND ') + ' END');
      }
      if (BOOLEAN.indexOf(i.toLowerCase()) !== -1) {
        var booleanExprs = [];

        for (var j in filters[i]) {
          if (filters[i].hasOwnProperty(j)) {
            _buildFilterExprs(filters[i][j], booleanExprs, '');
          }
        }

        expressions.push('(' + booleanExprs.join(' ' +
            i.toUpperCase() + ' ') + ')');
      } else if (i.toLowerCase() === 'not') {
        var notExprs = [];
        for (var z in filters[i]) {
          if (filters[i].hasOwnProperty(z)) {
            _buildFilterExprs(filters[i][z], notExprs, '');
          }
        }
        expressions.push('NOT (' + notExprs.join(' AND ') + ')');
      } else if (filters[i] instanceof Object) {
        _buildFilterExprs(filters[i], expressions, ident + '.');
      } else {
        if (typeof filters[i] === 'number' || typeof filters[i] === 'boolean') {
          expressions.push(ident + '=' + filters[i]);
        } else if (typeof filters[i] === 'string') {
          expressions.push(
            ident + '=\'' + filters[i].replace('\'', '\\\'') + '\'');
        } else {
          throw new Error('Invalid filter value.');
        }
      }
    }
  }
}

/**
 *
 * @param {string} selectRaw
 * @param {string} bucketRaw
 * @returns {string}
 * @private
 */
N1qlBuilder.prototype._toN1qlString = function(selectRaw, bucketRaw) {
  var clauses = [];

  clauses.push('SELECT ' + selectRaw);
  clauses.push('FROM ' + bucketRaw);

  if (this.filterExprs.length > 0) {
    var expressions = [];
    for (var i = 0; i < this.filterExprs.length; ++i) {
      _buildFilterExprs(this.filterExprs[i], expressions);
    }

    clauses.push('WHERE (' + expressions.join(') AND (') + ')');
  }

  if (this.orderByFields.length > 0) {
    var orderByStrs = [];
    for (var i = 0; i < this.orderByFields.length; ++i) {
      var orderByField = this.orderByFields[i];
      if (orderByField.direction === undefined) {
        orderByStrs.push(orderByField.name);
      } else {
        orderByStrs.push(orderByField.name + ' ' + orderByField.direction);
      }
    }

    clauses.push('ORDER BY ' + orderByStrs.join(','));
  }

  if (this.skipCount !== undefined) {
    clauses.push('SKIP ' + this.skipCount);
  }

  if (this.limitCount !== undefined) {
    clauses.push('LIMIT ' + this.limitCount);
  }

  return clauses.join(' ');
};

/**
 *
 * @param {string} bucketName
 * @returns {string}
 */
N1qlBuilder.prototype.toIdsN1qlString = function(bucketName) {
  return this._toN1qlString('META(b).id AS id', '`' + bucketName + '` b');
};

/**
 *
 * @param {string} bucketName
 * @returns {string}
 */
N1qlBuilder.prototype.toCountN1qlString = function(bucketName) {
  return this._toN1qlString('COUNT(b) AS count', '`' + bucketName + '` b')
};

module.exports = N1qlBuilder;
