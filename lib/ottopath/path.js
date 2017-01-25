'use strict';

var BasicPathEvaluator = require('./basicpathevaluator');

/**
 * @typedef {Object} OttoPathComponent
 * @property {"member"|"subscript"} operation
 * @property {Object} expression
 * @property {"wildcard"|"string_literal"|"identifier"} expression.type
 * @property {string} [expression.value]
 */

/**
 *
 * @type {ottopath.BasicPathEvaluator}
 * @private
 */
var _globalBasicEvaluator = new BasicPathEvaluator();


/**
 *
 * @constructor
 * @memberof ottopath
 */
function Path(components) {
  var numComponents = components.length;

  Object.defineProperty(this, 'length', {
    get: function () {
      return numComponents;
    }
  });

  for (var i = 0; i < components.length; ++i) {
    this[i] = components[i];
  }
}

/**
 *
 * @param {ottopath.PathEvaluator} evaluator
 * @param {Object[]} values
 * @returns {*}
 */
Path.prototype.evaluate = function(evaluator, values) {
  var values = values;

  for (var i = 0; i < this.length; ++i) {
    var pathPart = this[i];

    if (pathPart.operation === 'member') {
      if (pathPart.expression.type !== 'identifier') {
        throw new Error('Expected member operation to have an identifier.');
      }

      var newValuesI = [];
      for (var l = 0; l < values.length; ++l) {
        var newI = evaluator.member(values[l], pathPart.expression.value);
        newValuesI = newValuesI.concat(newI);
      }
      values = newValuesI;
    } else if (pathPart.operation === 'subscript') {
      if (pathPart.expression.type === 'identifier') {
        throw new Error('Expected subscript operation to be a non-identifier.');
      }

      if (pathPart.expression.type === 'wildcard') {
        var newValuesW = [];
        for (var j = 0; j < values.length; ++j) {
          var newJ = evaluator.wildSubscript(values[j]);
          newValuesW = newValuesW.concat(newJ);
        }
        values = newValuesW;
      } else if (pathPart.expression.type === 'numeric_literal' ||
        pathPart.expression.type === 'string_literal') {
        var newValuesN = [];
        for (var m = 0; m < values.length; ++m) {
          var newK = evaluator.subscript(values[m], pathPart.expression.value);
          newValuesN = newValuesN.concat(newK);
        }
        values = newValuesN;
      } else {
        throw new Error('Unexpected subscript operation expression type.');
      }
    } else {
      throw new Error('Unexpected path object operation type.');
    }
  }

  return values;
};

/**
 * @param {Object[]} objs
 * @returns {*}
 */
Path.prototype.query = function(objs) {
  return this.evaluate(_globalBasicEvaluator, objs);
};

/**
 *
 * @param {...ottopath.Path}
 * @returns {ottopath.Path}
 */
Path.prototype.concat = function() {
  var components = [];

  for (var i = 0; i < this.length; ++i) {
    components.push(this[i]);
  }

  for (var i = 0; i < arguments.length; ++i) {
    components = components.concat(arguments[i].components);
  }

  return new Path(components);
};

function _exprToString(exprObj) {
  if (exprObj.type === 'identifier') {
    return exprObj.value;
  } else if (exprObj.type === 'string_literal') {
    return '\'' + exprObj.value + '\'';
  } else if (exprObj.type === 'numeric_literal') {
    return exprObj.value;
  } else if (exprObj.type === 'wildcard') {
    return '*';
  } else {
    throw new Error('Unexpected expression object type.');
  }
}

Path.prototype.toString = function() {
  var pathStr = '';
  for (var i = 0; i < this.length; ++i) {
    var pathPart = this[i];

    if (pathPart.operation === 'member') {
      if (pathPart.expression.type !== 'identifier') {
        throw new Error('Expected member operation to have an identifier.');
      }

      if (pathStr !== '') {
        pathStr += '.';
      }
      pathStr += pathPart.expression.value;
    } else if (pathPart.operation === 'subscript') {
      if (pathPart.expression.type === 'identifier') {
        throw new Error('Expected subscript operation to be a non-identifier.');
      }

      pathStr += '[' + _exprToString(pathPart.expression) + ']';
    } else {
      throw new Error('Unexpected path object operation type `' +
        pathPart.operation + '`');
    }
  }
  return pathStr;
};

module.exports = Path;
