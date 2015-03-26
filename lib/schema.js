var util = require('util');
var autofns = require('./autofns');

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
  if (typeof a !== typeof b) {
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

SchemaIndex.prototype.bound = function() {
  return this.type !== null;
};

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
  this.name = null;
  this.type = '';
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
  console.log('Adding index', index);

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
  console.log('Adding indexFn', name, indexDef);
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

  var remoteType = this.context._typeByName(remoteTypeName);
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
  console.log('Adding queryFn', name, queryDef);
  if (!queryDef.type) {
    queryDef.type = 'view';
  }

  this._tryAddDefQueryFn(name, queryDef);

  var vqfn = new ViewQueryFn();
  vqfn.name = name;
  vqfn.type = queryDef.of;
  vqfn.field = queryDef.by;
  this.queryFns.push(vqfn);
};

Schema.prototype.addField = function(name, fieldDef) {
  if (typeof fieldDef === 'string' || this.context.isModel(fieldDef)) {
    fieldDef = {type: fieldDef};
  }

  if (name === 'id') {
    throw new Error('No user-defined fields may have the name `id`.');
  }

  var field = new SchemaField();
  field.name = name;
  field.readonly = (fieldDef.readonly === true);

  if (fieldDef.type !== undefined) {
    if (typeof fieldDef.type === 'string') {
      if (fieldDef.ref) {
        field.type = new ModelRef(fieldDef.type);
      } else {
        field.type = this.context.typeByName(fieldDef.type);
      }
    } else if (this.context.isModel(fieldDef.type)) {
      if (fieldDef.ref) {
        field.type = new ModelRef(fieldDef.type.schema.name);
      } else {
        field.type = fieldDef.type.schema;
      }
    } else {
      throw new Error('Invalid type passed for property ' + name);
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
      } else if (fieldDef.auto === 'counter') {
        if (field.type !== integerCoreType) {
          throw new Error('Automatic counter properties must be integer typed.');
        }
        var counterKey = this.name + '.' + name + '|autocounter';
        field.default = autofns.counterFn(counterKey);
      }
    } else if (fieldDef.default) {
      field.default = fieldDef.default;
    }

  } else {

    if (fieldDef.auto) {
      throw new Error('Anonymous struct in model cannot have an auto value.');
    }
    if (fieldDef.default) {
      throw new Error('Anonymous structs cannot have a default value.');
    }

    var mdl = this.context._buildModel('', fieldDef, {
      id: null
    });
    field.type = mdl;
    field.default = function() { return new mdl(); }

  }

  this.fields.push(field);
};

Schema.prototype.setIdField = function(path) {
  this.idField = path;

  if (this.idField) {
    var idField = this.field(this.idField);
    if (!idField) {
      throw new Error('Field `' + out.idField + '` specified for id of model `' + name + '` does not exist.');
    }
    if (!idField.readonly) {
      throw new Error('Field `' + out.idField + '` specified for id of model `' + name + '` must be readonly.');
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
        obj[i] = modelType.ref(data[i].$ref);
      } else {
        if (field.type instanceof CoreType) {
          obj[i] = data[i];
        } else if (this.context.isModel(field.type)) {
          obj[i] = this.context._deserializeCoo(field.type, data[i]);
        } else if (field.type instanceof ModelRef) {
          throw new Error('Encountered a ModelRef field, but the data does not agree!');
        } else {
          console.log(field);
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
