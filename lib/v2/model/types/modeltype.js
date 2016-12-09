'use strict';

var util = require('util');
var SchemaType = require('../../schema/types/schematype');

/**
 *
 * @param {Model} model
 * @constructor
 * @augments SchemaType
 */
function ModelType(model) {
  SchemaType.call(this);

  /** @type Model */
  this.model = model;
}
util.inherits(ModelType, SchemaType);

ModelType.prototype.validateValue = function(value) {
  // TODO: Validate that this is a Model of type this.model
};

module.exports = ModelType;
