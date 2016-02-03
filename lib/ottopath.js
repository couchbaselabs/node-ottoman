var jsonpath = require('jsonpath');

module.exports.parse = function(pathStr) {
  var path = jsonpath.parse(pathStr);
  for (var i = 0; i < path.length; ++i) {
    var pathPart = path[i];

    if (pathPart.scope !== 'child') {
      throw new Error('Expected child selectors only.');
    }
    if (pathPart.operation !== 'member' && pathPart.operation !== 'subscript') {
      throw new Error('Expected member and subscript selectors only.');
    }
    if (pathPart.expression.type === 'wildcard') {
      delete pathPart.expression.value;
    }

    delete pathPart.scope;
  }
  return path;
};

module.exports.query = function(pathObj, value) {
  var values = [ value ];
  for (var i = 0; i < pathObj.length; ++i) {
    var pathPart = pathObj[i];
    if (pathPart.operation === 'member') {
      if (pathPart.expression.type !== 'identifier') {
        throw new Error('Expected member operation to have an identifier.');
      }
      var newValues = [];
      for (var j = 0; j < values.length; ++j) {
        var newValue = values[j][pathPart.expression.value];
        if (newValue !== undefined && newValue !== null) {
          newValues.push(newValue);
        }
      }
      values = newValues;
    } else if (pathPart.operation === 'subscript') {
      if (pathPart.expression.type === 'identifier') {
        throw new Error('Expected subscript operation to be a non-identifier.');
      }

      if (pathPart.expression.type === 'wildcard') {
        var newValues = [];
        for (var j = 0; j < values.length; ++j) {
          for (var k = 0; k < values[j].length; ++k) {
            if (values[j][k] !== undefined && values[j][k] !== null) {
              newValues.push(values[j][k]);
            }
          }
        }
        values = newValues;
      } else if (pathPart.expression.type === 'numeric_literal' ||
          pathPart.expression.type === 'string_literal') {
        var newValues = [];
        for (var j = 0; j < values.length; ++j) {
          var newValue = values[j][pathPart.expression.value];
          if (newValue !== undefined && newValue !== null) {
            newValues.push(newValue);
          }
        }
        values = newValues;
      } else {
        throw new Error('Unexpected subscript operation expression type.');
      }
    } else {
      throw new Error('Unexpected path object operation type.');
    }
  }
};

module.exports.stringifyExpression = function(exprObj) {
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

module.exports.stringify = function(pathObj) {
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
