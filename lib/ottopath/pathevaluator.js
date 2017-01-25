'use strict';

/**
 *
 * @constructor
 * @memberof ottopath
 */
function PathEvaluator() {
}

/**
 *
 * @param {*} value
 * @param {string} identifier
 * @returns {Array}
 */
PathEvaluator.prototype.member = function(value, identifier) {
  throw new Error('not implemented');
};

/**
 *
 * @param {*} value
 * @param {string|number} key
 * @returns {Array}
 */
PathEvaluator.prototype.subscript = function(value, key) {
  throw new Error('not implemented');
};

/**
 *
 * @param {*} value
 * @returns {Array}
 */
PathEvaluator.prototype.wildSubscript = function(value) {
  throw new Error('not implemented');
};

module.exports = PathEvaluator;
