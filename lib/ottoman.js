var uuid = require('uuid');
var util = require('util');
var Schema = require('./schema');

function ModelData() {
  this.data = null;
  this.cas = null;
}

function ModelInstance(schema, args) {
  var $ = this.$ = {};
  Object.defineProperty(this, "$", {
    enumerable: false
  });

  $.schema = schema;
  $.cas = null;

  if (args.length === 0 && args[0] instanceof ModelData) {

  } else {
    $.schema.applyDefaultsToObject(this);

    $.schema.applyPropsToObj(this);
  }
};

ModelInstance.prototype.id = function() {
  // Should probably do this manually via split and follow.
  return eval('this.' + this.$.schema.idField);
};

ModelInstance.prototype.key = function() {
  return this.$.schema.name + '|' + this.id();
};

ModelInstance.prototype._toJSON = function(refType, forceTyping) {
  var objOut = {};

  if (forceTyping || this.$.schema.name !== refType) {
    objOut._type = this.$.schema.name;
  }

  for (var i in this) {
    /* istanbul ignore else */
    if (this.hasOwnProperty(i)) {
      if (this[i] instanceof ModelInstance) {
        objOut[i] = this[i]._toJSON(this.$.schema.field(i).type.name, forceTyping);
      } else {
        objOut[i] = this[i];
      }
    }
  }
  return objOut;
};

ModelInstance.prototype.toJSON = function() {
  return this._toJSON('Mixed', false);
};


function Ottoman() {
  this.models = {};

  Object.defineProperty(this, "models", {
    enumerable: false
  });
}

Ottoman.prototype.isModel = function(model) {
  return model.super_ === ModelInstance && model.schema instanceof Schema;
};

Ottoman.prototype.typeByName = function(type) {
  var coreType = Schema.coreTypeByName(type);
  if (coreType) {
    return coreType;
  }

  throw new Error('Invalid type specified (' + type + ')');
};

Ottoman.prototype._buildSchema = function(name, schemaDef, options) {
  var schema = new Schema(this);
  schema.name = name;

  for (var i in schemaDef) {
    /* istanbul ignore else */
    if (schemaDef.hasOwnProperty(i)) {
      schema.addField(i, schemaDef[i]);
    }
  }

  if (options.id === undefined) {
    if (!schema.field('_id')) {
      schema.addField('_id', {
        type: 'string',
        auto: 'uuid',
        readonly: true
      });
    }
    schema.setIdField('_id');
  } else {
    schema.setIdField(options.id);
  }

  return schema;
};

Ottoman.prototype._buildModel = function(name, schemaDef, options) {
  if (options === undefined) {
    options = {};
  }

  var schema = this._buildSchema(name, schemaDef, options);

  var model = null;
  eval('model = function ' + name + '() { ModelInstance.call(this, schema, arguments); }');

  /* istanbul ignore if */
  if (false) {
    // This exists only to show code completers that the function is in
    //   fact used, even though it only appears in the eval statement above.
    ModelInstance();
  }

  model.schema = schema;

  util.inherits(model, ModelInstance);
  return model;
};

Ottoman.prototype._buildAndRegisterModel = function(name, schemaDef, options) {
  if (this.models[name]) {
    throw new Error('A model with this name has already been registered.');
  }

  var model = this._buildModel(name, schemaDef, options);
  this.models[name] = model;
  return model;
};

Ottoman.prototype.model = function(name, schemaDef, options) {
  return this._buildAndRegisterModel(name, schemaDef, options);
};

// Create a default Ottoman instance, and expose the class through
//   the Ottoman property of it.
var ottoman = new Ottoman();
ottoman.Ottoman = Ottoman;

module.exports = ottoman;
