var util = require('util');
var autofns = require('./autofns');

/**
 * @class FieldDesc
 * @classdesc
 * The field description for a single field in a Schema.
 * @memberof Schema
 */
/**
 * The type of the field.  Should be specified as a name or
 * a reference to the Model itself.
 * @var {string|Model} Schema.FieldDesc#type
 */
/**
 * Specifies whether the field is read-only or not.
 * @var {undefined|boolean} Schema.FieldDesc#readonly
 */
/**
 * Specifies whether the field is automatically generated using
 * a built in auto-function (ex: uuid).
 * @var {undefined|"uuid"} Schema.FieldDesc#auto
 */
/**
 * Specifies whether this field (if it is a Model) is embedded
 * or referenced.
 * @var {undefined|boolean} Schema.FieldDesc#embed
 */
/**
 * A validator function used to verify that the value of this
 * field is acceptable before saving it to the database.
 * @var {undefined|function} Schema.FieldDesc#validator
 */

/**
 * @class Options
 * @classdesc
 * A list of options for this schema.
 * @memberof Schema
 */
/**
 * Specifies the path to the field which acts as this schema's
 * ID.  This path can reference embedded objects as well.
 * @var {string} Schema.Options#id
 */
/**
 * Defines the storage adapter used by this model for connecting
 * to the database.
 * @var {StoreAdapter} Schema.Options#store
 */

/**
 * A validator function validates a Schema field to ensure it
 * matches the expected traits.
 *
 * @typedef {function} Schema.Validator
 *
 * @param {*} value
 *  The value of the property being validated.
 */

function CoreType(type) {
  this.type = type;
}
CoreType.prototype.inspect = function() {
  return 'CoreType(' + this.type + ')'
};
var stringCoreType = new CoreType('string');
var numberCoreType = new CoreType('number');
var integerCoreType = new CoreType('integer');
var boolCoreType = new CoreType('boolean');
var dateCoreType = new CoreType('Date');
var mixedCoreType = new CoreType('Mixed');

function ModelRef(name) {
  this.name = name;
}
ModelRef.prototype.inspect = function() {
  return 'ModelRef(' + this.name + ')'
};


function SchemaField() {
  this.name = '';
  this.type = null;
  this.readonly = false;
  this.default = undefined;
  this.validator = null;
}


function _matchIndexes(a, b) {
  if (a.type !== b.type) {
    return false;
  }
  if (a.fields.length !== b.fields.length) {
    return false;
  }
  for (var i = 0; i < a.fields.length; ++i) {
    if (a.fields[i] !== b.fields[i]) {
      return false;
    }
  }
  return true;
}

function SchemaIndex(type) {
  this.type = null;
  this.schemaName = null;
  this.schema = null;
  this.fields = [];
}

function RefDocIndex() {
  SchemaIndex.call(this);
  this.type = 'refdoc';
}
util.inherits(RefDocIndex, SchemaIndex);

function SchemaIndexFn() {
  this.type = null;
  this.name = null;
  this.fields = null;
}

function RefDocIndexFn() {
  SchemaIndexFn.call(this);
  this.type = 'refdoc';
}
util.inherits(RefDocIndexFn, SchemaIndexFn);

function ViewQueryFn() {
  this.type = null;
  this.name = null;
  this.of = '';
  this.field = null;
}
Schema.ViewQueryFn = ViewQueryFn;


function Schema(context) {
  this.context = context;
  this.name = '';
  this.fields = [];
  this.idField = '';
  this.indices = [];
  this.indexFns = [];
  this.queryFns = [];
}

Schema.create = function(context, name, schemaDef, options) {
  var schema = new Schema(context);
  schema.name = name;

  for (var i in schemaDef) {
    /* istanbul ignore else */
    if (schemaDef.hasOwnProperty(i)) {
      var fieldDef = context.resolveFieldDef(schemaDef[i]);
      schema.addField(i, fieldDef);
    }
  }

  var indexFns = options.index;
  if (indexFns) {
    for (var i in indexFns) {
      schema.addIndexFn(i, indexFns[i]);
    }
  }

  var queryFns = options.queries;
  if (queryFns) {
    for (var i in queryFns) {
      schema.addQueryFn(i, queryFns[i]);
    }
  }

  if (options.id === undefined) {
    if (!schema.field('_id')) {
      var idFieldDef = context.resolveFieldDef({
        type: 'string',
        auto: 'uuid',
        readonly: true
      });
      schema.addField('_id', idFieldDef);
    }
    schema.setIdField('_id');
  } else {
    schema.setIdField(options.id);
  }

  if (options.bucket) {
    schema.bucket = options.bucket;
  } else {
    schema.bucket = context.bucket;
  }

  return schema;
};

Schema.prototype.validate = function(obj) {
  for (var i = 0; i < this.fields.length; ++i) {
    var field = this.fields[i];

    if (field.validator) {
      field.validator(obj[field.name]);
    }
  }
};

Schema.prototype.indexName = function(fields) {
  var fieldKeys = [];
  for (var i = 0; i < fields.length; ++i) {
    fieldKeys.push(fields[i].replace(/\./g, '::'));
  }
  return this.name + '$' + fieldKeys.join('$');
};

Schema.prototype.refKeyPrefix = function(fields) {
  return '$' + this.indexName(fields);
};

Schema.prototype.refKey = function(fields, values) {
  return this.refKeyPrefix(fields) + '|' + values.join('|');
};

Schema.prototype.refKeys = function(mdl) {
  var refKeys = [];
  if (!mdl.$.loaded) {
    throw new Error('Cannot generate reference keys for an unloaded object.');
  }
  for (var i = 0; i < this.indices.length; ++i) {
    var refIndex = this.indices[i];
    if (!(refIndex instanceof RefDocIndex)) {
      continue;
    }
    var refValues = [];
    for (var j = 0; j < refIndex.fields.length; ++j) {
      refValues.push(this.fieldVal(mdl, refIndex.fields[j]));
    }
    refKeys.push(this.refKey(refIndex.fields, refValues));
  }
  return refKeys;
};


Schema.prototype.addIndex = function(index) {
  for (var i = 0; i < this.indices.length; ++i) {
    var oldIndex = this.indices[i];
    if (_matchIndexes(oldIndex, index)) {
      return;
    }
  }

  this.indices.push(index);
};

Schema.prototype.addDefIndexFn = function(name, indexDef) {
  var fields = indexDef.by;
  if (!Array.isArray(fields)) {
    fields = [fields];
  }

  var index = new SchemaIndex();
  index.type = indexDef.type;
  index.schema = this;
  index.fields = fields;
  this.addIndex(index);

  var rdifn = new SchemaIndexFn();
  rdifn.type = indexDef.type;
  rdifn.name = name;
  rdifn.fields = fields;
  this.indexFns.push(rdifn);
};

Schema.prototype.addRefDocIndexFn = function(name, indexDef) {
  var fields = indexDef.by;
  if (!Array.isArray(fields)) {
    fields = [fields];
  }

  var index = new RefDocIndex();
  index.schema = this;
  index.fields = fields;
  this.addIndex(index);

  var rdifn = new RefDocIndexFn();
  rdifn.name = name;
  rdifn.fields = fields;
  this.indexFns.push(rdifn);
};

Schema.prototype.addIndexFn = function(name, indexDef) {
  if (!indexDef.type) {
    indexDef.type = 'view';
  }
  if (indexDef.type === 'refdoc') {
    this.addRefDocIndexFn(name, indexDef);
  } else {
    this.addDefIndexFn(name, indexDef);
  }
};

Schema.prototype._tryAddDefQueryFn = function(name, queryDef) {
  var remoteTypeName = queryDef.of;
  var remoteField = queryDef.by;

  var remoteType = this.context.typeByName(remoteTypeName);
  if (!remoteType) {
    this.context._delayBind(remoteTypeName, this._tryAddDefQueryFn.bind(this, name, queryDef));
    return;
  }

  var remoteSchema = remoteType.schema;

  var index = new SchemaIndex();
  index.type = queryDef.type;
  index.schema = remoteSchema;
  index.fields = [remoteField];
  remoteSchema.addIndex(index);
};

Schema.prototype.addQueryFn = function(name, queryDef) {
  if (!queryDef.type) {
    queryDef.type = 'view';
  }

  this._tryAddDefQueryFn(name, queryDef);

  var vqfn = new ViewQueryFn();
  vqfn.type = queryDef.type;
  vqfn.name = name;
  vqfn.of = queryDef.of;
  vqfn.field = queryDef.by;
  this.queryFns.push(vqfn);
};

Schema.prototype.addField = function(name, fieldDef) {
  if (name === 'id') {
    throw new Error('No user-defined fields may have the name `id`.');
  }

  var field = new SchemaField();
  field.name = name;
  field.readonly = (fieldDef.readonly === true);

  if (fieldDef.type instanceof CoreType) {
    if (fieldDef.embed !== undefined) {
      throw new Error('Cannot specify embed property on a field with a core type.');
    }
    field.type = fieldDef.type;
  } else {
    if (fieldDef.embed) {
      field.type = fieldDef.type;
    } else {
      field.type = new ModelRef(fieldDef.type.schema.name);
    }
  }

  if (fieldDef.auto) {
    if (fieldDef.default) {
      throw new Error('Property `' + name + '` cannot be both auto and have a default defined');
    }

    if (fieldDef.auto === 'uuid') {
      if (field.type !== stringCoreType) {
        throw new Error('Automatic uuid properties must be string typed.')
      }
      field.default = autofns.uuid;
    }
  } else if (fieldDef.default) {
    field.default = fieldDef.default;
  }

  this.fields.push(field);
};

Schema.prototype.setIdField = function(path) {
  this.idField = path;

  if (this.idField) {
    var idField = this.field(this.idField);
    if (!idField) {
      throw new Error('Field `' + path + '` specified for id of model `' + this.name + '` does not exist.');
    }
    if (!idField.readonly) {
      throw new Error('Field `' + path + '` specified for id of model `' + this.name + '` must be readonly.');
    }
  }
};

Schema.prototype.fieldVal = function(mdl, name) {
  return eval('mdl.' + name);
};

Schema.prototype.field = function(name) {
  var parts = name.split('.');
  var lclPart = parts.shift();

  for (var i = 0; i < this.fields.length; ++i) {
    var field = this.fields[i];
    if (field.name == lclPart) {
      if (parts.length === 0) {
        return field;
      } else {
        if (this.context.isModel(field.type)) {
          return field.type.schema.field(parts.join('.'));
        } else if (field.type instanceof ModelRef) {
          throw new Error('Path cannot refer through reference type.');
        } else {
          throw new Error('Invalid path specified.');
        }
      }
    }
  }
  return null;
};

Schema.prototype.applyDataToObject = function(obj, data) {
  for (var i in data) {
    if (data.hasOwnProperty(i)) {
      if (i === '_type') {
        continue;
      }

      var field = this.field(i);
      if (!field) {
        throw new Error('Could not find matching field for `' + i + '`.');
      }

      if (data[i] instanceof Object && data[i].$ref) {
        // This is a reference type!
        if (!(field.type instanceof ModelRef)) {
          throw new Error('Field looks like a reference, but model does not agree!');
        }
        var modelType = this.context.typeByName(field.type.name);
        // TODO: This should probably be checked earlier than this!
        if (!modelType) {
          throw new Error('Invalid type specified (' + field.type.name + ')');
        }
        obj[i] = modelType.ref(data[i].$ref);
      } else {
        if (field.type instanceof CoreType) {
          obj[i] = data[i];
        } else if (this.context.isModel(field.type)) {
          obj[i] = field.type.fromData(data[i]);
        } else if (field.type instanceof ModelRef) {
          throw new Error('Encountered a ModelRef field, but the data does not agree!');
        } else {
          throw new Error('Unknown field type for field `' + i + '`.');
        }
      }
    }
  }
};

Schema.prototype.applyDefaultsToObject = function(obj) {
  for (var i = 0; i < this.fields.length; ++i) {
    var field = this.fields[i];

    if (field.default instanceof Function) {
      obj[field.name] = field.default();
    } else if (field.default !== undefined) {
      obj[field.name] = field.default;
    }
  }
};

Schema.prototype.applyPropsToObj = function(obj) {
  for (var i = 0; i < this.fields.length; ++i) {
    var field = this.fields[i];

    if (field.readonly) {
      Object.defineProperty(obj, field.name, {
        writable: false
      });
    }
  }
};

var _typeByNameLkp = {
  'string': stringCoreType,
  'number': numberCoreType,
  'integer': integerCoreType,
  'boolean': boolCoreType,
  'Date': dateCoreType,
  'Mixed': mixedCoreType
};
Schema.coreTypeByName = function(type) {
  var coreType = _typeByNameLkp[type];
  if (coreType) {
    return coreType;
  }
  return null;
};

Schema.isCoreType = function(type) {
  return type instanceof CoreType;
};

Schema.StringType = stringCoreType;
Schema.NumberType = numberCoreType;
Schema.IntegerType = integerCoreType;
Schema.BooleanType = boolCoreType;
Schema.DateType = dateCoreType;
Schema.MixedType = mixedCoreType;
Schema.ModelRef = ModelRef;
Schema.Index = SchemaIndex;
Schema.RefDocIndexFn = RefDocIndexFn;
Schema.RefDocIndex = RefDocIndex;

module.exports = Schema;
