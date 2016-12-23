'use strict';

var util = require('util');
var uuid = require('uuid');
var Schema = require('./schema/schema');
var SchemaField = require('./schema/schemafield');
var StringType = require('./schema/types/stringtype');
var SchemaDescParser = require('./schemadescparser');

/**
 *
 * @constructor
 * @implements SchemaTypeDb
 */
function Ottoman() {
  /** @type Schema[] */
  this.schemas = [];

  /** @type Model[] */
  this.models = [];

  /** @type StoreAdapter */
  this.store = null;
}

/**
 * @callback ValidatorFn
 * @param {*} {value}
 */

/**
 * @typedef {string|Model|Schema|SchemaDesc|FullTypeDesc} TypeDesc
 */

/**
 * @typedef {Object} FullTypeDesc
 * @property {TypeDesc} type
 * @property {string} ref
 * @property {boolean} readonly
 * @property {boolean} required
 * @property {*|Function} default
 * @property {ValidatorFn} validator
 */

// TODO: Doc note, inline schema's are automatically marked `required` and have
//  a default which instantiates them implicitly.
/**
 * @typedef {Object.<string, TypeDesc>} SchemaDesc
 */

/**
 *
 * @param {string} name
 * @returns {Schema}
 */
Ottoman.prototype.getSchemaByName = function(name) {
  for (var i = 0; i < this.schemas.length; ++i) {
    if (this.schemas[i].name === name) {
      return this.schemas[i];
    }
  }

  return null;
};

/**
 *
 * @param {string} name
 * @returns {Model}
 */
Ottoman.prototype.getModelByName = function(name) {
  for (var i = 0; i < this.models.length; ++i) {
    if (this.models[i].name === name) {
      return this.models[i];
    }
  }

  return null;
};

/**
 *
 * @param {Schema} schema
 * @returns {boolean}
 * @override
 */
Ottoman.prototype.isSchemaRegistered = function(schema) {
  var foundSchema = this.getSchemaByName(schema.name);
  return foundSchema === schema;
};

/**
 *
 * @param {string} name
 * @returns {Model|Schema|SchemaType}
 * @override
 */
Ottoman.prototype.getTypeByName = function(name) {
  var coreType = Schema.getTypeByName(name);
  if (coreType) {
    return coreType;
  }

  var model = this.getModelByName(name);
  if (model) {
    return model;
  }

  var schema = this.getSchemaByName(name);
  if (schema) {
    return schema;
  }

  return null;
};

/**
 *
 * @param {string} name
 * @param {SchemaDesc} schemaDesc
 * @returns {Schema}
 * @private
 */
Ottoman.prototype._parseSchemaDesc = function(name, schemaDesc) {
  return (new SchemaDescParser(this).parse(name, schemaDesc));
};

/**
 *
 * @param {string} name
 * @param {SchemaDesc} schema
 * @param {Object} [options]
 * @param {string} [options.id]
 * @param {IndexDesc} [options.indexes]
 * @param {QueryDesc} [options.queries]
 * @param {StoreAdapter} [options.store]
 */
Ottoman.prototype.model = function(name, schema, options) {
  if (options === undefined) {
    options = {};
  }

  var foundType = this.getTypeByName(name);
  if (foundType) {
    throw new Error('name already registered');
  }

  var schemaName = '_' + name + '_Schema';

  var schema = this._parseSchemaDesc(schemaName, schema);
  var model = Model.new(name, schema);

  // TODO: Support compound ids
  if (options.hasOwnProperty('id')) {
    model.setIdField(options.id);
  } else {
    if (!schema.getField('_id')) {
      var idField = new SchemaField();
      idField.type = new StringType();
      idField.readonly = true;
      idField.required = true;
      idField.default = function() { return uuid.v4(); };
      schema.addField('_id', idField);
    }

    model.setIdField('_id');
  }

  if (options.hasOwnProperty('store')) {
    model.setStore(options.store);
  } else {
    if (!this.store) {
      throw new Error('cannot specify models without a store set');
    }

    model.setStore(this.store);
  }

  this.models.push(model);
  return model;
};

/**
 *
 * @param {string} name
 * @param {SchemaDesc} schema
 * @param {Object} [options]
 */
Ottoman.prototype.struct = function(name, schema, options) {
  if (options === undefined) {
    options = {};
  }

  var foundType = this.getTypeByName(name);
  if (foundType) {
    throw new Error('name already registered');
  }

  var schema = this._parseSchemaDesc(name, schema);

  this.schemas.push(schema);
  return schema;
};

/**
 * @callback EnsureIndicesCallback
 * @param {Error} err
 */

/**
 *
 * @param {EnsureIndicesCallback} callback
 */
Ottoman.prototype.ensureIndices = function(callback) {
  // TODO: Implement me!
};

var ottoman = new Ottoman();
ottoman.Ottoman = Ottoman;
module.exports = ottoman;
