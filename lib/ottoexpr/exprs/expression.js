'use strict';

var util = require('util');

/**
 *
 * @constructor
 * @memberof ottoexpr
 */
function Expression() {
}

/**
 *
 * @param {number} depth
 * @param {Object} options
 * @param {string} name
 * @param {Array} subexprs
 * @returns {string}
 * @private
 */
Expression._inspectGen = function(depth, options, name, subexprs) {
  var newOptions = Object.assign({}, options, {
    depth: options.depth === null ? null : options.depth - 1
  });

  var padding = ' '.repeat(2);

  var subexprsStrs = [];
  for (var i = 0; i < subexprs.length; ++i) {
    subexprsStrs.push(padding +
      util.inspect(subexprs[i], newOptions).replace(/\n/g, '\n' + padding));
  }

  return name + '(\n' + subexprsStrs.join('\n') + ')';
};

module.exports = Expression;
