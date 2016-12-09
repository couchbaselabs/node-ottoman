'use strict';

var util = require('util');
var SchemaType = require('../../schema/types/schematype');

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

ModelRefType.prototype.validateValue = function(value) {
  // TODO: Validate that the value is a Model of type this.modelName.
};

module.exports = ModelRefType;
