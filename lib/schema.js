var util = require('util');
var autofns = require('./autofns');

function SchemaOptions() {
  this.id = '_id';
  this.store = null;
}

function FieldDef() {
  this.type = null;
  this.readonly = false;
  this.auto = null;
  this.embed = false;
  this.validator = null;
}

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

function ListField(type) {
  this.type = type;
};

function SchemaField() {
  this.name = '';
  this.type = null;
  this.readonly = false;
  this.default = undefined;
  this.validator = null;
}

function FieldGroup() {
  this.fields = [];
}

FieldGroup.prototype.create = function() {
  // TODO: Initialize field values here...
  return {};
};

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
  this.preHandlers = {};
  this.postHandlers = {};
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

  if (options.store) {
    schema.store = options.store;
  } else {
    schema.store = context.store;
  }

  return schema;
};

Schema.prototype.namePath = function() {
  return this.context.nsPrefix() + this.name;
};

Schema.prototype._validate = function(mdlInst) {
  for (var i = 0; i < this.fields.length; ++i) {
    var field = this.fields[i];

    if (field.validator) {
      field.validator(mdlInst[field.name]);
    }
  }
};

Schema.prototype.validate = function(mdlInst, callback) {
  var self = this;
  this.execPreHandlers('validate', mdlInst, function(err) {
    if (err) {
      callback(err);
      return;
    }

    try {
      self._validate(mdlInst);
    } catch (e) {
      callback(e);
      return;
    }

    self.execPostHandlers('validate', mdlInst, callback);
  });
};

Schema.prototype.indexName = function(fields) {
  var fieldKeys = [];
  for (var i = 0; i < fields.length; ++i) {
    fieldKeys.push(fields[i].replace(/\./g, '::'));
  }
  return this.namePath() + '$' + fieldKeys.join('$');
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

// TODO: Resolve ModelRef's at the context level...
Schema.prototype.addField = function(name, fieldDef) {
  if (name === 'id') {
    throw new Error('No user-defined fields may have the name `id`.');
  }

  var field = new SchemaField();
  field.name = name;
  field.readonly = (fieldDef.readonly === true);
  field.type = fieldDef.type;

  if (fieldDef.list) {
    if (fieldDef.auto) {
      throw new Error('Property `' + name + '` cannot be both a list and be auto.');
    }

    field.type = new ListField(field.type);

    if (fieldDef.default) {
      field.default = fieldDef.default;
    }
  } else if (fieldDef.auto) {
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
    if (field.type === dateCoreType && fieldDef.default === Date.now) {
      field.default = function() { return new Date(); };
    } else {
      field.default = fieldDef.default;
    }
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

function _fieldSearch(context, fields, name) {
  var parts = name.split('.');
  var lclPart = parts.shift();

  for (var i = 0; i < fields.length; ++i) {
    var field = fields[i];
    if (field.name == lclPart) {
      if (parts.length === 0) {
        return field;
      } else {
        if (context.isModel(field.type)) {
          // TODO: This may not actually be good to have here...
          return field.type.schema.field(parts.join('.'));
        } else if (field.type instanceof FieldGroup) {
          return _fieldSearch(context, field.type.fields, parts.join('.'));
        } else if (field.type instanceof ModelRef) {
          throw new Error('Path cannot refer through reference type.');
        } else {
          throw new Error('Invalid path specified.');
        }
      }
    }
  }
  return null;
}

Schema.prototype.field = function(name) {
  return _fieldSearch(this.context, this.fields, name);
};

function _findField(fields, name) {
  for (var i = 0; i < fields.length; ++i) {
    if (fields[i].name === name) {
      return fields[i];
    }
  }
  return null;
}

function _applyData(context, fields, obj, data) {
  for (var i in data) {
    if (data.hasOwnProperty(i)) {
      if (i === '_type') {
        continue;
      }

      var field = _findField(fields, i);
      if (!field) {
        throw new Error('Could not find schema field for `' + i + '`.');
      }

      if (data[i] instanceof Object && data[i].$ref) {
        // This is a reference type!
        if (!(field.type instanceof ModelRef)) {
          throw new Error('Field looks like a reference, but model does not agree!');
        }
        var modelType = context.typeByName(field.type.name);
        // TODO: This should probably be checked earlier than this!
        if (!modelType) {
          throw new Error('Invalid type specified (' + field.type.name + ')');
        }
        obj[i] = modelType.ref(data[i].$ref);
      } else {
        if (field.type instanceof CoreType) {
          if (field.type === dateCoreType) {
            obj[i] = new Date(data[i]);
          } else {
            obj[i] = data[i];
          }
        } else if (context.isModel(field.type)) {
          obj[i] = field.type.fromData(data[i]);
        } else if (field.type instanceof FieldGroup) {
          if (!(data[i] instanceof Object)) {
            throw new Error('Encountered a group field, but the data does not agree!');
          }

          obj[i] = {};
          _applyData(context, field.type.fields, obj[i], data[i]);
        } else if (field.type instanceof ModelRef) {
          throw new Error('Encountered a ModelRef field, but the data does not agree!');
        } else {
          throw new Error('Unknown field type for field `' + i + '`.');
        }
      }
    }
  }
}

Schema.prototype.applyDataToObject = function(obj, data) {
  _applyData(this.context, this.fields, obj, data);
};

Schema.prototype.applyDefaultsToObject = function(obj) {
  for (var i = 0; i < this.fields.length; ++i) {
    var field = this.fields[i];

    if (field.type instanceof FieldGroup) {
      obj[field.name] = field.type.create();
    } else {
      if (field.default instanceof Function) {
        obj[field.name] = field.default();
      } else if (field.default !== undefined) {
        obj[field.name] = field.default;
      }
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

Schema.prototype.execPreHandlers = function(event, mdlInst, callback) {
  if (!this.preHandlers[event]) {
    callback(null);
    return;
  }

  var self = this;
  var i = 0;
  function doNext() {
    if (i === self.preHandlers.length) {
      callback(null);
      return;
    }

    var curI = i;
    i++;
    this.preHandlers[curI](mdlInst, doNext);
  };
  doNext();
};

Schema.prototype.execPostHandlers = function(event, mdlInst, callback) {
  try {
    for (var i = 0; i < this.postHandlers.length; ++i) {
      this.postHandlers[i](mdlInst);
    }
    callback(null);
  } catch (e) {
    callback(e);
  }
};

var supportedEvents = ['validate', 'save', 'remove'];

Schema.prototype.addPreHandler = function(event, callback) {
  if (supportedEvents.indexOf(event) === -1) {
    throw new Error('Unsupported event type `' + event + '`.');
  }
  if (!this.preHandlers[event]) {
    this.preHandlers[event] = [];
  }
  this.preHandlers[event].push(callback);
};

Schema.prototype.addPostHandler = function(event, fn) {
  if (supportedEvents.indexOf(event) === -1) {
    throw new Error('Unsupported event type `' + event + '`.');
  }
  if (!this.postHandlers[event]) {
    this.postHandlers[event] = [];
  }
  this.postHandlers[event].push(fn);
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
Schema.ListField = ListField;
Schema.FieldGroup = FieldGroup;
Schema.Index = SchemaIndex;
Schema.RefDocIndexFn = RefDocIndexFn;
Schema.RefDocIndex = RefDocIndex;

module.exports = Schema;
