'use strict';

/**
 *
 * @constructor
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
  throw new Error('member operation is not implemented');
};

/**
 *
 * @param {*} value
 * @param {string|number} key
 * @returns {Array}
 */
PathEvaluator.prototype.subscript = function(value, key) {
  throw new Error('subscript operation is not implemented');
};

/**
 *
 * @param {*} value
 * @returns {Array}
 */
PathEvaluator.prototype.wildSubscript = function(value) {
  throw new Error('wildSubscript operation is not implemented');
};

module.exports = PathEvaluator;
