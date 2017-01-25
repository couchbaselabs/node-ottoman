'use strict';

var util = require('util');
var SchemaType = require('../../schema/types/schematype');
var ModelInstance = require('./../modelinstance');

/**
 *
 * @param {string} refType
 * @constructor
 * @augments SchemaType
 */
function ModelRefType(refModelName) {
  SchemaType.call(this);

  /** @type string */
  this.modelName = refModelName;
}
util.inherits(ModelRefType, SchemaType);

ModelRefType.prototype.coerceValue = function(value) {
  if (!(value instanceof ModelInstance)) {
    throw new TypeError('must use ModelInstance for model ref fields');
  }

  if (value.constructor.name !== this.modelName) {
    throw new TypeError('expected type of type ' + this.modelName);
  }

  return value;
};

ModelRefType.prototype.validateValue = function(value, context) {
  // TODO: Validate that the value is a Model of type this.modelName.
};

module.exports = ModelRefType;
