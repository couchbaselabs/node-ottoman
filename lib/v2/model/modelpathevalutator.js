'use strict';

var util = require('util');
var Model = require('./model');
var ModelRefType = require('./types/modelreftype');
var SchemaPathEvaluator = require('./../schema/schemapathevaluator');
var EmbeddedSchemaType = require('./../schema/types/embeddedschematype');

/**
 *
 * @param options
 * @constructor
 * @augments SchemaPathEvaluator
 */
function ModelPathEvaluator(context, options) {
  SchemaPathEvaluator.call(this);

  /** @type {SchemaTypeDb} */
  this.context = context;

  /** @type {boolean} */
  this.directOnly = true;

  if (options.hasOwnProperty('directOnly')) {
    this.directOnly = !!options['directOnly'];
  }
}
util.inherits(ModelPathEvaluator, SchemaPathEvaluator);

/**
 *
 * @param {*} value
 * @returns {*}
 * @private
 */
ModelPathEvaluator.prototype._translateValue = function(value) {
  if (!(value instanceof ModelRefType)) {
    return value;
  }

  if (this.directOnly) {
    return null;
  }

  /** @type ModelRefType */
  var refValue = value;

  var refType = this.context.getTypeByName(refValue.modelName);
  if (!(refType instanceof Model)) {
    return null;
  }

  /** @type Model */
  var refModel = refType;

  return new EmbeddedSchemaType(refModel.schema);
};

/**
 *
 * @param {*} value
 * @param {string} identifier
 * @returns {*}
 * @override
 */
ModelPathEvaluator.prototype.member = function(value, identifier) {
  value = this._translateValue(value);
  if (!value) {
    return [];
  }

  return this.constructor.super_.prototype.member.call(this, value, identifier);
};

/**
 *
 * @param {*} value
 * @param {string|number} key
 * @returns {*}
 * @override
 */
ModelPathEvaluator.prototype.subscript = function(value, key) {
  value = this._translateValue(value);
  if (!value) {
    return [];
  }

  return this.constructor.super_.prototype.subscript.call(this, value, key);
};

/**
 *
 * @param {*} value
 * @returns {*}
 * @override
 */
ModelPathEvaluator.prototype.wildSubscript = function(value) {
  value = this._translateValue(value);
  if (!value) {
    return [];
  }

  return this.constructor.super_.prototype.wildSubscript.call(this, value);
};

module.exports = ModelPathEvaluator;
