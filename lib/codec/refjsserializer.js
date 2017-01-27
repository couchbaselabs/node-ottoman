'use strict';

var util = require('util');
var JsSerializer = require('./jsserializer');

/**
 *
 * @param {Ottoman} context
 * @constructor
 * @augments JsSerializer
 */
function RefJsSerializer(context) {
  JsSerializer.call(this, context);
}
util.inherits(RefJsSerializer, JsSerializer);

RefJsSerializer.prototype._serializeModel = function(model, mdlInst) {
  return {
    '$ref': model.name,
    '$id': mdlInst.id()
  };
};

RefJsSerializer.prototype._deserializeModel = function(model, data) {
  if (!data.hasOwnProperty('$ref')) {
    throw new TypeError('missing $ref field from model ref');
  }
  if (!data.hasOwnProperty('$id')) {
    throw new TypeError('missing $id field from model ref');
  }

  if (data['$ref'] !== model.name) {
    throw new Error('reference type does not match data type');
  }

  return model.ref(data['$id']);
};

module.exports = RefJsSerializer;
