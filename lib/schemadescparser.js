'use strict';

var Schema = require('./schema/schema');
var SchemaField = require('./schema/schemafield');
var EmbeddedSchemaType = require('./schema/types/embeddedschematype');
var ListType = require('./schema/types/listtype');
var Model = require('./model/model');
var ModelRefType = require('./model/types/modelreftype');

/**
 *
 * @param {SchemaTypeDb} context
 * @constructor
 */
function SchemaDescParser(context) {
  /** @type SchemaTypeDb */
  this.context = context;
}

/**
 *
 * @param {TypeDesc} fieldDesc
 * @returns {SchemaType}
 * @private
 */
SchemaDescParser.prototype._parseTypeDesc = function(path, typeDesc) {
  if (typeof typeDesc === 'string') {
    var type = this.context.getTypeByName(typeDesc);
    if (!type) {
      throw new Error('failed to identify type `' + typeDesc + '`')
    }
    return type;
  } else if (Schema.isSchema(typeDesc)) {
    return new EmbeddedSchemaType(typeDesc);
  } else if (Model.isModel(typeDesc)) {
    return new ModelRefType(typeDesc.name);
  } else if (Array.isArray(typeDesc)) {
    if (typeDesc.length !== 1) {
      throw new Error('unexpected list descriptor format');
    }

    var itemType = this._parseTypeDesc(path, typeDesc[0]);

    if (itemType instanceof EmbeddedSchemaType &&
      !this.context.isSchemaRegistered(itemType.schema)) {
      throw new Error('lists must not contain implicitly defined schemas');
    }

    return new ListType(itemType);
  } else if (typeDesc instanceof Object) {
    var schema = this._parseSchemaDesc(path, typeDesc);
    return new EmbeddedSchemaType(schema);
  } else {
    throw new Error('unexpected type description type');
  }
};

/**
 *
 * @param {string} path
 * @param {TypeDesc} fieldDesc
 * @returns {SchemaField}
 * @private
 */
SchemaDescParser.prototype._parseFieldDesc = function(path, fieldDesc) {
  var field = new SchemaField();

  // TODO: `ref` should be deprecated!

  if (Schema.isSchema(fieldDesc) || Model.isModel(fieldDesc) ||
      !(fieldDesc instanceof Object) ||
      !(fieldDesc.hasOwnProperty('ref') || fieldDesc.hasOwnProperty('type'))) {
    fieldDesc = {
      type: fieldDesc
    }
  }

  if (fieldDesc.hasOwnProperty('ref') && fieldDesc.hasOwnProperty('type')) {
    throw new Error('cannot specify both type and ref on same field');
  } else if (fieldDesc.hasOwnProperty('ref')) {
    var refModelName = '';
    if (fieldDesc.ref instanceof Model) {
      refModelName = fieldDesc.ref.name;
    } else {
      if (typeof fieldDesc.ref !== 'string') {
        throw new Error('ref must specify a model or model name');
      }

      refModelName = fieldDesc.ref;
    }

    field.type = new ModelRefType(refModelName);
  } else {
    field.type = this._parseTypeDesc(path, fieldDesc.type);
  }

  if (fieldDesc.hasOwnProperty('default')) {
    field.default = fieldDesc['default'];
  }

  if (fieldDesc.hasOwnProperty('readonly')) {
    if (typeof fieldDesc.required !== 'boolean') {
      throw new Error('readonly property of field descriptor must be boolean');
    }

    field.required = fieldDesc.readonly;
  }

  if (fieldDesc.hasOwnProperty('required')) {
    if (typeof fieldDesc.required !== 'boolean') {
      throw new Error('required property of field descriptor must be boolean');
    }

    field.required = fieldDesc.required;
  }

  if (fieldDesc.hasOwnProperty('validator')) {
    if (typeof fieldDesc.validator !== 'Function') {
      throw new Error('validator property of field descriptor must be a funciton');
    }

    field.validator = fieldDesc.validator;
  }

  if (field.type instanceof EmbeddedSchemaType &&
    !this.context.isSchemaRegistered(field.type.schema)) {
    // this is an embedded implicit schema, it has special requirements

    if (fieldDesc.hasOwnProperty('required')) {
      throw new Error('implicit schemas cannot specify a value for `required`');
    }

    if (fieldDesc.hasOwnProperty('default')) {
      throw new Error('implicit schemas cannot specify a value for `default`');
    }

    field.required = true;
    field.default = function() {
      return new field.type.schema();
    };
  }

  return field;
};

/**
 *
 * @param {string} name
 * @param {SchemaDesc} schemaDesc
 * @returns {Schema}
 * @private
 */
SchemaDescParser.prototype._parseSchemaDesc = function(name, schemaDesc) {
  var schema = Schema.new(name);

  for (var i in schemaDesc) {
    if (schemaDesc.hasOwnProperty(i)) {
      var field = this._parseFieldDesc([name, i].join('_'), schemaDesc[i]);
      schema.addField(i, field);
    }
  }

  return schema;
};

/**
 *
 * @param {string} name
 * @param {SchemaDesc} schemaDesc
 * @returns {Schema}
 */
SchemaDescParser.prototype.parse = function(name, schemaDesc) {
  return this._parseSchemaDesc(name, schemaDesc)
};

module.exports = SchemaDescParser;
