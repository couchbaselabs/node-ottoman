'use strict';

var util = require('util');
var JsSerializer = require('./jsserializer');

/**
 *
 * @param {Ottoman} context
 * @constructor
 * @augments JsSerializer
 */
function CooSerializer(context) {
  JsSerializer.call(this, context);
}
util.inherits(CooSerializer, JsSerializer);

CooSerializer.prototype._serializeModel = function(model, mdlInst) {
  return {
    '_type': model.name,
    '$ref': mdlInst.id()
  };
};

CooSerializer.prototype.serialize = function(mdlInst) {
  var ModelType = mdlInst.constructor;
  var data = JsSerializer.prototype.serialize.call(this, mdlInst);
  data['_type'] = ModelType.name;
  return data;
};

CooSerializer.prototype._deserializeModel = function(model, data) {
  if (!data.hasOwnProperty('_type')) {
    throw new TypeError('missing _type field from model ref');
  }
  if (!data.hasOwnProperty('$ref')) {
    throw new TypeError('missing $ref field from model ref');
  }

  if (data['_type'] !== model.name) {
    throw new Error('reference type does not match data type');
  }

  return model.ref(data['$ref']);
};

/**
 *
 * @param {Schema} schema
 * @param {*} data
 * @returns {*}
 */
CooSerializer.prototype.decode = function(schema, data) {
  if (data.hasOwnProperty('_type')) {
    var foundModel = this.context.getTypeByName(data['_type']);
    if (foundModel !== schema) {
      throw new TypeError('data does not match passed type');
    }

    delete data['_type'];
  }

  return JsSerializer.prototype.decode.call(this, schema, data);
};

/**
 *
 * @param {*} data
 * @returns {ModelInstance}
 */
CooSerializer.prototype.deserialize = function(data) {
  var model = null;
  if (data.hasOwnProperty('_type')) {
    model = this.context.getTypeByName(data['_type']);
    if (!model) {
      throw new TypeError('data references unregistered type');
    }
  } else {
    throw new Error('data does not include type information');
  }

  return JsSerializer.prototype.deserialize.call(this, data);
};

module.exports = CooSerializer;
