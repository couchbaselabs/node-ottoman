'use strict';

var jsonpath = require('jsonpath');
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
 * @type {BasicPathEvaluator}
 * @private
 */
var _globalBasicEvaluator = new BasicPathEvaluator();

/**
 *
 * @constructor
 */
function OttoPath() {
  this.components = [];
}

/**
 *
 * @param {PathEvaluator} evaluator
 * @param {Object[]} values
 * @returns {*}
 */
OttoPath.prototype.evaluate = function(evaluator, values) {
  var values = values;

  for (var i = 0; i < this.components.length; ++i) {
    var pathPart = this.components[i];

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

OttoPath.prototype.concat = function() {
  var components = this.components;

  for (var i = 0; i < arguments.length; ++i) {
    components = components.concat(arguments[i].components);
  }

  var newPath = new OttoPath();
  newPath.components = components;
  return newPath;
};

OttoPath.prototype.query = function(objs) {
  return this.evaluate(_globalBasicEvaluator, objs);
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

OttoPath.prototype.toString = function() {
  var pathStr = '';
  for (var i = 0; i < this.components.length; ++i) {
    var pathPart = this.components[i];
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

OttoPath.parse = function(pathStr) {
  if (pathStr === '') {
    return new OttoPath();
  }

  // Temporary fix until we have our own parser.
  var dollarKey = 'SUPERWACKYDOLLARKEY';

  var path = jsonpath.parse(pathStr.replace('$', dollarKey));
  for (var i = 0; i < path.length; ++i) {
    var pathPart = path[i];

    if (pathPart.scope !== 'child') {
      throw new Error('Expected child selectors only.');
    }
    if (pathPart.operation !== 'member' &&
      pathPart.operation !== 'subscript') {
      throw new Error('Expected member and subscript selectors only.');
    }
    if (pathPart.expression.type === 'wildcard') {
      delete pathPart.expression.value;
    }

    if (pathPart.expression.value) {
      pathPart.expression.value =
        pathPart.expression.value.replace(dollarKey, '$');
    }

    delete pathPart.scope;
  }

  var pathObj = new OttoPath();
  pathObj.components = path;
  return pathObj;
};

module.exports = OttoPath;
