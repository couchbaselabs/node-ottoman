'use strict';

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
