'use strict';

/**
 *
 * @param {string} type
 * @param {string[]} fields
 * @constructor
 */
function ModelIndex(type, fields) {
  /**
   * @type {string}
   */
  this.type = type;

  /**
   * @type {string[]}
   */
  this.fields = fields;
}

module.exports = ModelIndex;
