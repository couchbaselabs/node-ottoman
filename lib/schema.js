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
  this.schemaName = null;
  this.schema = null;
  this.fields = [];
}

function RefDocIndex() {
  SchemaIndex.call(this);
}
util.inherits(RefDocIndex, SchemaIndex);
Schema.RefDocIndex = RefDocIndex;

function ViewIndex() {
  SchemaIndex.call(this);
}
util.inherits(ViewIndex, SchemaIndex);
Schema.ViewIndex = ViewIndex;

SchemaIndex.prototype.bound = function() {
  return this.type !== null;
};

function SchemaIndexFn() {
  this.name = null;
  this.fields = null;
}

function ViewIndexFn() {
  SchemaIndexFn.call(this);
}
util.inherits(ViewIndexFn, SchemaIndexFn);
Schema.ViewIndexFn = ViewIndexFn;

function RefDocIndexFn() {
  SchemaIndexFn.call(this);
}
util.inherits(RefDocIndexFn, SchemaIndexFn);
Schema.RefDocIndexFn = RefDocIndexFn;

function Schema(context) {
  this.context = context;
  this.name = '';
  this.fields = [];
  this.idField = '';
  this.indices = [];
  this.indexFns = [];
}

Schema.prototype.ddocName = function() {
  return '_otto_' + this.name;
};

Schema.prototype.refKeyPrefix = function(fields) {
  var fieldKeys = [];
  for (var i = 0; i < fields.length; ++i) {
    fieldKeys.push(fields[i].replace(/\./g, '::'));
  }
  return '$' + this.name + '$' + fieldKeys.join('$');
}

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

Schema.prototype.addViewIndexFn = function(name, indexDef) {
  var fields = indexDef.by;
  if (!Array.isArray(fields)) {
    fields = [fields];
  }

  var index = new ViewIndex();
  index.schema = this;
  index.fields = fields;
  this.addIndex(index);

  var rdifn = new ViewIndexFn();
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
  if (indexDef.type === 'view' || !indexDef.type) {
    this.addViewIndexFn(name, indexDef);
  } else if (indexDef.type === 'refdoc') {
    this.addRefDocIndexFn(name, indexDef);
  } else {
    throw new Error('Unrecognized index type `' + indexDef.type + '`');
  }
};

Schema.prototype.addViewQueryFn = function(name, queryDef) {

};

Schema.prototype.addQueryFn = function(name, queryDef) {
  console.log('Adding queryFn', name, queryDef);
  if (queryDef.type === 'view' || !queryDef.type) {
    this.addViewQueryFn(name, queryDef);
  } else {
    throw new Error('Unrecognized query type `' + queryDef.type + '`');
  }
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

      if (field.type instanceof CoreType) {
        obj[i] = data[i];
      } else if (this.context.isModel(field.type)) {
        obj[i] = this.context._deserializeCoo(field.type, data[i]);
      } else {
        console.log(field);
        throw new Error('Unknown field type for field `' + i + '`.');
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
  'boolean': boolCoreType
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
Schema.ModelRef = ModelRef;

module.exports = Schema;
