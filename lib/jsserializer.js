'use strict';

var SchemaInstance = require('./schema/schemainstance');
var ModelInstance = require('./model/modelinstance');
var DateType = require('./schema/types/datetype');
var EmbeddedSchemaType = require('./schema/types/embeddedschematype');
var PrimitiveType = require('./schema/types/primitivetype');
var ModelRefType = require('./model/types/modelreftype');

/**
 *
 * @param {Ottoman} context
 * @constructor
 */
function JsSerializer(context) {
  this.context = context;
}

JsSerializer.prototype._serializeModelRef = function(model, mdlInst) {
  return {
    '$ref': model.name,
    '$id': mdlInst.id()
  };
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
    return this._serializeModelRef(ModelType, value);
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

JsSerializer.prototype._deserializeModelRef = function(modelName, data) {
  if (!data.hasOwnProperty('$ref')) {
    throw new TypeError('missing $ref field from model ref');
  }
  if (!data.hasOwnProperty('$id')) {
    throw new TypeError('missing $id field from model ref');
  }

  if (data['$ref'] !== modelName) {
    throw new Error('reference type does not match data type');
  }

  var model = this.context.getModelByName(modelName);
  if (!model) {
    throw new TypeError('referenced type ' + modelName + ' not found');
  }

  return model.ref(data['$id']);
};

JsSerializer.prototype._deserializeBasic = function(type, data) {
  return type.coerceValue(data);
};

JsSerializer.prototype._deserializeDate = function(type, data) {
  return type.coerceValue(data);
};

JsSerializer.prototype._deserializeValue = function(type, data) {
  if (type instanceof DateType) {
    return this._deserializeDate(type, data);
  } else if (type instanceof PrimitiveType) {
    return this._deserializeBasic(type, data);
  } else if (type instanceof EmbeddedSchemaType) {
    return this._deserializeSchema(type.schema, data);
  } else if (type instanceof ModelRefType) {
    return this._deserializeModelRef(type.modelName, data);
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

JsSerializer.prototype.deserialize = function(model, data) {
  return this._deserializeSchema(model.schema, data);
};

module.exports = JsSerializer;
