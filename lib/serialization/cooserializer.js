'use strict';

var util = require('util');
var JsSerializer = require('./jsserializer');
var Model = require('./../model/model');
var Schema = require('./../schema/schema');
var DateType = require('./../schema/types/datetype');

/**
 *
 * @param {Ottoman} context
 * @constructor
 * @augments JsSerializer
 */
function CooSerializer(context, options) {
  if (!options) {
    options = {};
  }

  JsSerializer.call(this, context, options);

  this.typeField = '_type';

  this.explicitTypes = false;

  if (options.hasOwnProperty('typeField')) {
    this.typeField = options.typeField;
  }

  if (options.hasOwnProperty('explicitTypes')) {
    this.explicitTypes = true;
  }
}
util.inherits(CooSerializer, JsSerializer);

CooSerializer.prototype._serializeModel = function(mdlInst, isMixed) {
  var data = {
    '$ref': mdlInst.id()
  };

  if (isMixed || this.explicitTypes) {
    data[this.typeField] = mdlInst.constructor.name;
  }

  return data;
};

CooSerializer.prototype._serializeSchema = function(schemaInst, isMixed) {
  var data = JsSerializer.prototype._serializeSchema.call(this, schemaInst, isMixed);

  if (isMixed || this.explicitTypes) {
    data[this.typeField] = schemaInst.constructor.name;
  }

  return data;
};

CooSerializer.prototype._serializeDate = function(value, isMixed) {
  if (isMixed) {
    var data = {
      v: value.toJSON()
    };
    data[this.typeField] = 'Date';
    return data;
  } else {
    return value.toJSON();
  }
};

CooSerializer.prototype.serialize = function(mdlInst) {
  var ModelType = mdlInst.constructor;
  var data = JsSerializer.prototype.serialize.call(this, mdlInst);
  data[this.typeField] = ModelType.name;
  return data;
};

CooSerializer.prototype._deserializeModel = function(model, data) {
  if (!data.hasOwnProperty('$ref')) {
    throw new TypeError('missing $ref field from model ref');
  }

  if (!model) {
    if (!data.hasOwnProperty(this.typeField)) {
      throw new TypeError('missing type field from model ref');
    }

    model = this.context.getModelByName(data[this.typeField]);
  } else {
    if (data.hasOwnProperty(this.typeField) && model.name !== data[this.typeField]) {
      throw new Error('reference type (' + model.name + ') does not match data type (' + data[this.typeField] + ')');
    }
  }

  return model.ref(data['$ref']);
};

CooSerializer.prototype._deserializeSchema = function(schema, data) {
  // TODO: Check that the data matches the input model.
  // TODO: Should probably copy before this delete.
  delete data[this.typeField];

  return JsSerializer.prototype._deserializeSchema(schema, data);
};


CooSerializer.prototype._deserializeMixed = function(data) {
  if (typeof data === 'string') {
    return data;
  } else if (typeof data === 'boolean') {
    return data;
  } else if (typeof data === 'number') {
    return data;
  } else if (Array.isArray(data)) {
    var out = [];
    for (var i = 0; i < data.length; ++i) {
      out.push(this._deserializeMixed(data[i]));
    }
    return out;
  } else if (data instanceof Object) {
    if (!data.hasOwnProperty(this.typeField)) {
      // Lack of a type field indicates this is a map...
      return data;
    }

    var typeName = data[this.typeField];
    var type = this.context.getTypeByName(typeName);
    if (Model.isModel(type)) {
      return this._deserializeModel(type, data);
    } else if (Schema.isSchema(type)) {
      return this._deserializeSchema(type, data);
    } else if (type instanceof DateType) {
      return new Date(data['v']);
    } else {
      throw new TypeError('unexpected data type ' + typeName);
    }
  }

  throw new TypeError('unexpected data');
};

/**
 *
 * @param {Schema} schema
 * @param {*} data
 * @returns {*}
 */
CooSerializer.prototype.decode = function(schema, data) {
  if (data.hasOwnProperty(this.typeField)) {
    var foundModel = this.context.getTypeByName(data[this.typeField]);
    if (!foundModel) {
      throw new TypeError('data references unregistered type');
    }
    if (!Model.isModel(foundModel)) {
      throw new TypeError('data references non-model type');
    }
    if (foundModel.schema !== schema) {
      throw new TypeError('data does not match passed type');
    }

    // TODO: Maybe we should copy before being destructive
    delete data[this.typeField];
  }

  return JsSerializer.prototype.decode.call(this, schema, data);
};

module.exports = CooSerializer;
