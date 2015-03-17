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



function Schema(context) {
  this.context = context;
  this.name = '';
  this.fields = [];
  this.idField = '';
}

Schema.prototype.addField = function(name, fieldDef) {
  if (typeof fieldDef === 'string') {
    fieldDef = {type: fieldDef};
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
