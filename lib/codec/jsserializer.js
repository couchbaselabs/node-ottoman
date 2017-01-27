'use strict';

var SchemaInstance = require('./../schema/schemainstance');
var ModelInstance = require('./../model/modelinstance');
var BooleanType = require('./../schema/types/booleantype');
var DateType = require('./../schema/types/datetype');
var EmbeddedSchemaType = require('./../schema/types/embeddedschematype');
var ListType = require('./../schema/types/listtype');
var MixedType = require('./../schema/types/mixedtype');
var NumberType = require('./../schema/types/numbertype');
var StringType = require('./../schema/types/stringtype');
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

/**
 *
 * @param {Schema} schema
 * @param {*} data
 * @returns {*}
 * @private
 */
JsSerializer.prototype._serializeAsSchema = function(schema, data) {
  var out = {};
  schema.forEachField(function(name, field) {
    if (data.hasOwnProperty(name) && data[name] !== undefined) {
      var isMixedField = false;
      if (field.type instanceof MixedType) {
        isMixedField = true;
      } else if (field.type instanceof ListType) {
        if (field.type.itemType instanceof MixedType) {
          isMixedField = true;
        }
      }

      out[name] = this._serializeValue(data[name], isMixedField);
    }
  }.bind(this));
  return out;
};

/**
 *
 * @param {ModelInstance} mdlInst
 * @param {boolean} isMixed
 * @returns {*}
 * @private
 */
JsSerializer.prototype._serializeModel = function(mdlInst, isMixed) {
  var model = mdlInst.constructor;
  return this._serializeAsSchema(model.schema, mdlInst);
};

/**
 *
 * @param {SchemaInstance} schemaInst
 * @param {boolean} isMixed
 * @returns {*}
 * @private
 */
JsSerializer.prototype._serializeSchema = function(schemaInst, isMixed) {
  var schema = schemaInst.constructor;
  return this._serializeAsSchema(schema, schemaInst);
};

/**
 *
 * @param {*} value
 * @param {boolean} isMixed
 * @returns {*}
 * @private
 */
JsSerializer.prototype._serializeList = function(value, isMixed) {
  var out = [];
  for (var i = 0; i < value.length; ++i) {
    out[i] = this._serializeValue(value[i], isMixed);
  }
  return out;
};

/**
 *
 * @param {*} value
 * @param {boolean} isMixed
 * @returns {*}
 * @private
 */
JsSerializer.prototype._serializeBasic = function(value, isMixed) {
  return value;
};

/**
 *
 * @param {Date} value
 * @param {boolean} isMixed
 * @returns {*}
 * @private
 */
JsSerializer.prototype._serializeDate = function(value, isMixed) {
  return value.toJSON();
};

/**
 *
 * @param {*} value
 * @param {boolean} isMixed
 * @returns {}
 * @private
 */
JsSerializer.prototype._serializeObject = function(value, isMixed) {
  var out = {};
  for (var i in value) {
    if (value.hasOwnProperty(i)) {
      out[i] = this._serializeValue(value[i], isMixed);
    }
  }
  return out;
};

/**
 *
 * @param {*} value
 * @param {boolean} isMixed
 * @returns {*}
 * @private
 */
JsSerializer.prototype._serializeValue = function(value, isMixed) {
  if (value instanceof ModelInstance) {
    return this._serializeModel(value, isMixed);
  } else if (value instanceof SchemaInstance) {
    return this._serializeSchema(value, isMixed);
  } else if (Array.isArray(value)) {
    return this._serializeList(value, isMixed);
  } else if (value instanceof Date) {
    return this._serializeDate(value, isMixed);
  } else if (typeof value === 'string') {
    return this._serializeBasic(value, isMixed);
  } else if (typeof value === 'number') {
    return this._serializeBasic(value, isMixed);
  } else if (typeof value === 'boolean') {
    return this._serializeBasic(value, isMixed);
  } else if (value instanceof Object) {
    return this._serializeObject(value, isMixed);
  } else {
    throw new TypeError('unknown type ' + (typeof value));
  }
};

JsSerializer.prototype.serialize = function(mdlInst) {
  return this._serializeAsSchema(mdlInst.constructor.schema, mdlInst);
};

JsSerializer.prototype._deserializeAsSchema = function(schema, data) {
  var out = {};
  schema.forEachField(function(name, field) {
    if (data.hasOwnProperty(name)) {
      out[name] = this._deserializeValue(field.type, data[name]);
    }
  }.bind(this));
  return out;
};

JsSerializer.prototype._deserializeModel = function(model, data) {
  var decodedData = this._deserializeAsSchema(model.schema, data);
  return new model(decodedData);
};

JsSerializer.prototype._deserializeSchema = function(schema, data) {
  var decodedData = this._deserializeAsSchema(schema, data);
  return new schema(decodedData);
};

JsSerializer.prototype._deserializeList = function(itemType, data) {
  var out = [];
  for (var i = 0; i < data.length; ++i) {
    out.push(this._deserializeValue(itemType, data[i]));
  }
  return out;
};

JsSerializer.prototype._deserializeBasic = function(data) {
  return data;
};

JsSerializer.prototype._deserializeDate = function(data) {
  return new Date(data);
};

JsSerializer.prototype._deserializeMixed = function(data) {
  throw new Error('cannot deserialize objects containing mixed types');
};

JsSerializer.prototype._deserializeValue = function(type, data) {
  if (type instanceof DateType) {
    return this._deserializeDate(data);
  } else if (type instanceof BooleanType) {
    return this._deserializeBasic(data);
  } else if (type instanceof NumberType) {
    return this._deserializeBasic(data);
  } else if (type instanceof StringType) {
    return this._deserializeBasic(data);
  } else if (type instanceof ListType) {
    return this._deserializeList(type.itemType, data);
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

/**
 *
 * @param {Schema} schema
 * @param {*} data
 * @returns {*}
 */
JsSerializer.prototype.decode = function(schema, data) {
    return this._deserializeAsSchema(schema, data);
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
