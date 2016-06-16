'use strict';

var jsonpath = require('jsonpath');

module.exports.parse = function (pathStr) {
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
  return path;
};

module.exports.query = function (pathObj, value) {
  var values = [value];
  for (var i = 0; i < pathObj.length; ++i) {
    var pathPart = pathObj[i];
    if (pathPart.operation === 'member') {
      if (pathPart.expression.type !== 'identifier') {
        throw new Error('Expected member operation to have an identifier.');
      }
      var newValuesI = [];
      for (var l = 0; l < values.length; ++l) {
        var newValueI = values[l][pathPart.expression.value];
        if (newValueI !== undefined && newValueI !== null) {
          newValuesI.push(newValueI);
        }
      }
      values = newValuesI;
    } else if (pathPart.operation === 'subscript') {
      if (pathPart.expression.type === 'identifier') {
        throw new Error('Expected subscript operation to be a non-identifier.');
      }

      if (pathPart.expression.type === 'wildcard') {
        var newValuesW = [];
        for (var j = 0; j < values.length; ++j) {
          for (var k = 0; k < values[j].length; ++k) {
            if (values[j][k] !== undefined && values[j][k] !== null) {
              newValuesW.push(values[j][k]);
            }
          }
        }
        values = newValuesW;
      } else if (pathPart.expression.type === 'numeric_literal' ||
        pathPart.expression.type === 'string_literal') {
        var newValuesN = [];
        for (var m = 0; m < values.length; ++m) {
          var newValueN = values[m][pathPart.expression.value];
          if (newValueN !== undefined && newValueN !== null) {
            newValuesN.push(newValueN);
          }
        }
        values = newValuesN;
      } else {
        throw new Error('Unexpected subscript operation expression type.');
      }
    } else {
      throw new Error('Unexpected path object operation type.');
    }
  }
};

module.exports.stringifyExpression = function (exprObj) {
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
};

module.exports.stringify = function (pathObj) {
  var pathStr = '';
  for (var i = 0; i < pathObj.length; ++i) {
    var pathPart = pathObj[i];
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

      pathStr += '[' + this.stringifyExpression(pathPart.expression) + ']';
    } else {
      throw new Error('Unexpected path object operation type.');
    }
  }
  return pathStr;
};
