'use strict';

var util = require('util');
var StoreAdapter = require('./storeadapter');

var SearchConsistency = StoreAdapter.SearchConsistency;

function SchemaOptions() {
  this.id = '_id';
  this.store = null;
  this.keyDelimiter = '|';
}

function FieldDef() {
  this.type = null;
  this.readonly = false;
  this.auto = null;
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
  return 'CoreType(' + this.type + ')';
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
  return 'ModelRef(' + this.name + ')';
};

function ListField(type) {
  this.type = type;
}
ListField.prototype.inspect = function() {
  return 'ListField(' + util.inspect(this.type) + ')';
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

function SchemaIndex() {
  this.type = null;
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
  this.consistency = SearchConsistency.NONE;
}

function RefDocIndexFn() {
  SchemaIndexFn.call(this);
  this.type = 'refdoc';
  this.consistency = SearchConsistency.GLOBAL;
}
util.inherits(RefDocIndexFn, SchemaIndexFn);

function ViewQueryFn() {
  this.type = null;
  this.name = null;
  this.of = '';
  this.field = null;
  this.consistency = SearchConsistency.NONE;
}


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
  rdifn.consistency = indexDef.consistency;
  this.indexFns.push(rdifn);
};

Schema.prototype.addRefDocIndexFn = function(name, indexDef) {
  var fields = indexDef.by;
  if (!Array.isArray(fields)) {
    fields = [fields];
  }

  if (indexDef.consistency !== undefined &&
      indexDef.consistency !== SearchConsistency.GLOBAL) {
    throw new Error('Cannot define refdoc index with non-global consistency.');
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
    this.context._delayBind(
        remoteTypeName, this._tryAddDefQueryFn.bind(this, name, queryDef));
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
  vqfn.consistency = queryDef.consistency;
  this.queryFns.push(vqfn);
};

Schema.prototype.addField = function(field) {
  this.fields.push(field);
};

Schema.prototype.setIdField = function(path) {
  this.idField = path;

  if (this.idField) {
    var idField = this.field(this.idField);
    if (!idField) {
      throw new Error(
          'Field `' + path +
          '` specified for id of model `' + this.name +
          '` does not exist.');
    }
    if (!idField.readonly) {
      throw new Error('Field `' + path +
      '` specified for id of model `' + this.name +
      '` must be readonly.');
    }
  }
};

Schema.prototype.fieldVal = function(mdl, name) {
  return eval( // jshint -W061
      'mdl.' + name);
};

function _fieldSearch(context, fields, name) {
  var parts = name.split('.');
  var lclPart = parts.shift();

  for (var i = 0; i < fields.length; ++i) {
    var field = fields[i];
    if (field.name === lclPart) {
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

function _decodeValue(context, type, data) {
  if (data instanceof Object && data.$ref) {
    if (!(type instanceof ModelRef)) {
      throw new Error(
          'Field looks like a reference, but model does not agree!');
    }

    var modelType = context.typeByName(type.name);
    // TODO: This should probably be checked earlier than this!
    if (!modelType) {
      throw new Error('Invalid type specified (' + type.name + ')');
    }
    return modelType.ref(data.$ref);
  } else if (data instanceof Object && data._type) {
    if (type === mixedCoreType) {
      type = context.typeByName(data._type);
      if (!type) {
        throw new Error('Could not deduce mixed type from data.');
      }
    }

    return type.fromData(data);
  } else {
    if (type instanceof CoreType) {
      if (type === dateCoreType) {
        return new Date(data);
      } else {
        return data;
      }
    } else if (context.isModel(type)) {
      return type.fromData(data);
    } else if (type instanceof ListField) {
      if (!Array.isArray(data)) {
        throw new Error(
            'Encountered a list field, but the data does not agree!');
      }

      var outArr = [];
      for (var i = 0; i < data.length; ++i) {
        outArr[i] = _decodeValue(context, type.type, data[i]);
      }
      return outArr;
    } else if (type instanceof FieldGroup) {
      if (!(data instanceof Object)) {
        throw new Error(
            'Encountered a group field, but the data does not agree!');
      }

      var outObj = {};
      _decodeFields(context, type.fields, outObj, data);
      return outObj;
    } else if (type instanceof ModelRef) {
      throw new Error(
          'Encountered a ModelRef field, but the data does not agree!');
    } else {
      throw new Error('Unknown field type.');
    }
  }
}

function _decodeFields(context, fields, obj, data) {
  for (var i in data) {
    if (data.hasOwnProperty(i)) {
      if (i === '_type') {
        continue;
      }

      var field = _findField(fields, i);
      if (!field) {
        throw new Error('Could not find schema field for `' + i + '`.');
      }

      obj[i] = _decodeValue(context, field.type, data[i]);
    }
  }
}

Schema.prototype.applyDataToObject = function(obj, data) {
  _decodeFields(this.context, this.fields, obj, data);
};

function _decodeUserValue(context, type, data) {
  if (type instanceof CoreType) {
    if (type === dateCoreType) {
      return new Date(data);
    } else {
      return data;
    }
  } else if (context.isModel(type)) {
    var TypeCtor = type;
    return new TypeCtor(data);
  } else if (type instanceof ListField) {
    if (!Array.isArray(data)) {
      throw new Error(
          'Encountered a list field, but the data does not agree!');
    }

    var outArr = [];
    for (var i = 0; i < data.length; ++i) {
      outArr[i] = _decodeUserValue(context, type.type, data[i]);
    }
    return outArr;
  } else if (type instanceof FieldGroup) {
    if (!(data instanceof Object)) {
      throw new Error(
          'Encountered a group field, but the data does not agree!');
    }

    var outObj = {};
    _decodeUserFields(context, type.fields, outObj, data);
    return outObj;
  } else if (type instanceof ModelRef) {
    var expectedType = context.typeByName(type.name);
    if (!(data instanceof expectedType)) {
      throw new Error('Expected value to be a ModelInstance of type `' +
          type.name + '`.');
    }
    return data;
  } else {
    throw new Error('Unknown field type.');
  }
}

function _decodeUserFields(context, fields, obj, data) {
  for (var i in data) {
    if (data.hasOwnProperty(i)) {
      var field = _findField(fields, i);
      if (!field) {
        throw new Error('Could not find schema field for `' + i + '`.');
      }

      obj[i] = _decodeUserValue(context, field.type, data[i]);
    }
  }
}

Schema.prototype.applyUserDataToObject = function(obj, data) {
  _decodeUserFields(this.context, this.fields, obj, data);
};

Schema.prototype.applyDefaultsToObject = function(obj) {
  for (var i = 0; i < this.fields.length; ++i) {
    var field = this.fields[i];

    if (field.type instanceof FieldGroup) {
      obj[field.name] = field.type.create();
    } else if (field.type instanceof ListField) {
      obj[field.name] = [];
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

  var preHandlers = this.preHandlers[event];
  var i = 0;
  var doNext = function _doNextPreHandler() {
    if (i === preHandlers.length) {
      callback(null);
      return;
    }

    var curI = i;
    i++;
    preHandlers[curI].call(mdlInst, doNext);
  };
  doNext();
};

Schema.prototype.execPostHandlers = function(event, mdlInst, callback) {
  if (!this.postHandlers[event]) {
    callback(null);
    return;
  }

  try {
    var postHandlers = this.postHandlers[event];
    for (var i = 0; i < postHandlers.length; ++i) {
      postHandlers[i](mdlInst);
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
Schema.Field = SchemaField;
Schema.ModelRef = ModelRef;
Schema.ListField = ListField;
Schema.FieldGroup = FieldGroup;
Schema.Index = SchemaIndex;
Schema.ViewQueryFn = ViewQueryFn;
Schema.RefDocIndexFn = RefDocIndexFn;
Schema.RefDocIndex = RefDocIndex;

module.exports = Schema;
