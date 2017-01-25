'use strict';

// TODO: Improve ottopath namespace description
/**
 * Ottopath provides a JSONpath-like interface for defining, querying and
 * processing paths to objects inside Ottoman.
 *
 * @namespace ottopath
 */

var jsonpath = require('jsonpath');
var Path = require('./path');

/**
 * @param {string} pathStr
 * @returns {ottopath.Path}
 * @memberof ottopath
 */
function parse(pathStr) {
  if (pathStr === '') {
    return new Path();
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

  return new Path(path);
}
exports.parse = parse;

exports.BasicPathEvaluator = require('./basicpathevaluator');
exports.Path = Path;
exports.PathEvaluator = require('./pathevaluator');

