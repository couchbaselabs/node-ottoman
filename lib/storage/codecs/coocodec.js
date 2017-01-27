'use strict';

var ottoexpr = require('./../../ottoexpr/ottoexpr');
var CooSerializer = require('./.././cooserializer');

/**
 *
 * @param {Ottoman} o
 * @param {Object} options
 * @param {string} [typeField]
 * @param {boolean} [explicitTypes]
 * @constructor
 */
function CooCodec(o, options) {
  if (!options) {
    options = {};
  }

  /** @type string */
  this.typeField = '_type';

  if (options.hasOwnProperty('typeField')) {
    this.typeField = options.typeField;
  }

  /** @type Serializer */
  this.serializer = new CooSerializer(o, {
    explicitTypes: options.explicitTypes,
    typeField: this.typeField
  });
}

/**
 *
 * @param {ModelInstance} mdlInst
 * @returns {*}
 */
CooCodec.prototype.serialize = function(mdlInst) {
  return this.serializer.serialize(mdlInst);
};

/**
 *
 * @param {Schema} schema
 * @param {*} data
 * @returns {*}
 */
CooCodec.prototype.decode = function(schema, data) {
  return this.serializer.decode(schema, data);
};

/**
 *
 * @param {ottoexpr.Expression} expr
 * @param {Model} model
 */
CooCodec.prototype.filter = function(expr, model) {
  return new ottoexpr.AndExpr(
    new ottoexpr.EqualsExpr(this.typeField, model.name),
    expr);
};
