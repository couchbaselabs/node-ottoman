'use strict';

var SchemaInstance = require('./../schema/schemainstance');
var ModelInstance = require('./../model/modelinstance');
var DateType = require('./../schema/types/datetype');
var EmbeddedSchemaType = require('./../schema/types/embeddedschematype');
var MixedType = require('./../schema/types/mixedtype');
var PrimitiveType = require('./../schema/types/primitivetype');
var ModelRefType = require('./../model/types/modelreftype');

/**
 *
 * @param {Ottoman} context
 * @constructor
 * @augments Serializer
 */
function JsSerializer(context) {
  this.context = context;
}

JsSerializer.prototype._serializeModel = function(model, mdlInst) {
  return this._serializeSchema(model.schema, mdlInst);
};

/**
 *
 * @param {Schema} schema
 * @param {SchemaInstance} schemaInst
 * @returns {Object}
 */
JsSerializer.prototype._serializeSchema = function(schema, schemaInst) {
  var out = {};
  schema.forEachField(function(name) {
    if (schemaInst.hasOwnProperty(name) && schemaInst[name] !== undefined) {
      out[name] = this._serializeValue(schemaInst[name]);
    }
  }.bind(this));
  return out;
};

JsSerializer.prototype._serializeBasic = function(value) {
  return value;
};

JsSerializer.prototype._serializeDate = function(value) {
  return value.toString();
};

JsSerializer.prototype._serializeObject = function(value) {
  var out = {};
  for (var i in value) {
    if (value.hasOwnProperty(i)) {
      out[i] = this._serializeValue(value[i]);
    }
  }
  return out;
};

JsSerializer.prototype._serializeValue = function(value) {
  if (value instanceof ModelInstance) {
    var ModelType = value.constructor;
    return this._serializeModel(ModelType, value);
  } else if (value instanceof SchemaInstance) {
    var SchemaType = value.constructor;
    return this._serializeSchema(SchemaType, value);
  } else if (typeof value === 'Date') {
    return this._serializeDate(value);
  } else if (typeof value === 'string') {
    return this._serializeBasic(value);
  } else if (typeof value === 'number') {
    return this._serializeBasic(value);
  } else if (typeof value === 'boolean') {
    return this._serializeBasic(value);
  } else if (value instanceof Object) {
    return this._serializeObject(value);
  } else {
    throw new TypeError('unknown type ' + (typeof value));
  }
};

JsSerializer.prototype.serialize = function(mdlInst) {
  var ModelType = mdlInst.constructor;
  return this._serializeSchema(ModelType.schema, mdlInst);
};

JsSerializer.prototype._deserializeModel = function(model, data) {
  var decodedData = this._deserializeSchema(model.schema, data);
  return new model(decodedData);
};

JsSerializer.prototype._deserializeBasic = function(type, data) {
  return data;
};

JsSerializer.prototype._deserializeDate = function(type, data) {
  return new Date(data);
};

JsSerializer.prototype._deserializeMixed = function(data) {
  throw new Error('cannot deserialize objects containing a mixed type');
};

JsSerializer.prototype._deserializeValue = function(type, data) {
  if (type instanceof DateType) {
    return this._deserializeDate(type, data);
  } else if (type instanceof PrimitiveType) {
    return this._deserializeBasic(type, data);
  } else if (type instanceof EmbeddedSchemaType) {
    return this._deserializeSchema(type.schema, data);
  } else if (type instanceof ModelRefType) {
    var model = this.context.getModelByName(type.modelName);
    if (!model) {
      throw new TypeError('could not find model ' + type.modelName);
    }

    return this._deserializeModel(model, data);
  } else if (type instanceof MixedType) {
    return this._deserializeMixed(data);
  } else {
    throw new TypeError('unexpected type ' + type.constructor.name);
  }
};

JsSerializer.prototype._deserializeSchema = function(schema, data) {
  var out = {};
  schema.forEachField(function(name, field) {
    if (data.hasOwnProperty(name)) {
      out[name] = this._deserializeValue(field.type, data[name]);
    }
  }.bind(this));
  return out;
};

/**
 *
 * @param {Schema} schema
 * @param {*} data
 * @returns {*}
 */
JsSerializer.prototype.decode = function(schema, data) {
    return this._deserializeSchema(schema, data);
};

/**
 *
 * @param {Model} model
 * @param {*} data
 * @returns {ModelInstance}
 */
JsSerializer.prototype.deserialize = function(model, data) {
  var decodedData = this.decode(model.schema, data);
  return new model(decodedData);
};

module.exports = JsSerializer;
