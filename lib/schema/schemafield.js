'use strict';

/**
 * @callback ValidatorCallback
 * @param {*} value
 * @throws Error
 */

/**
 *
 * @constructor
 */
function SchemaField() {
  /**
   * @type {SchemaType}
   */
  this.type = null;

  /**
   * @type {boolean}
   */
  this.required = false;

  /**
   * @type {boolean}
   */
  this.readonly = false;

  /**
   * @type {Function|*}
   */
  this.default = undefined;

  /**
   * @type {ValidatorCallback}
   */
  this.validator = null;
}

/**
 *
 * @param {*} value
 * @throws Error
 */
SchemaField.prototype.validateValue = function(value) {
  if (this.required) {
    if (value === null) {
      throw new Error('a required field must not be null');
    } else if (value === undefined) {
      throw new Error('a required field must not be undefined');
    }
  }

  this.type.validateValue(value);

  if (this.validator) {
    this.validator(value);
  }
};

module.exports = SchemaField;
