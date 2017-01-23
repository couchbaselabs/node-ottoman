'use strict';

var ModelInstance = require('./modelinstance');
var Schema = require('./schema');

function ModelData() {
  this.key = null;
  this.data = null;
}

function KvSerializer() {
}

KvSerializer.prototype.indexName = function (schemaNamePath, fields) {
  var fieldKeys = [];
  for (var i = 0; i < fields.length; ++i) {
    fieldKeys.push(fields[i].replace(/\./g, '::'));
  }
  return schemaNamePath + '$' + fieldKeys.join('$');
};

KvSerializer.prototype._refKeyPrefix = function (schemaNamePath, fields) {
  return '$' + this.indexName(schemaNamePath, fields);
};

KvSerializer.prototype.genRefKey = function(schemaNamePath, fields, values) {
  return this._refKeyPrefix(schemaNamePath, fields) + '|' + values.join('|');
};

KvSerializer.prototype.genModelRefKeys = function(mdlInst) {
  var mdlSchema = ModelInstance.getModelSchema(mdlInst);

  var refIndices = [];
  for (var i = 0; i < mdlSchema.indices.length; ++i) {
    var index = mdlSchema.indices[i];
    if (index.type === 'refdoc') {
      refIndices.push(index);
    }
  }

  if (refIndices.length === 0) {
    return [];
  }

  // Generate all our reference keys
  var refKeys = [];

  for (var i = 0; i < refIndices.length; ++i) {
    var refIndex = refIndices[i];
    var refValues = [];

    for (var j = 0; j < refIndex.fields.length; ++j) {
      var value = mdlSchema.fieldVal(mdlInst, refIndex.fields[j]);
      //Prevents refdoc keys from having "undefined" values
      if (value === undefined) {
        refValues = [];
        break;
      }
      refValues.push(value);
    }

    //only if there were defined values should the refkey go through
    // this allows any number of null values to be stored without colliding
    if (refValues.length > 0) {
      refKeys.push(this.genRefKey(mdlSchema.namePath(), refIndex.fields, refValues));
    }
  }

  return refKeys;
};

KvSerializer.prototype.genModelKey = function(mdlInst) {
  var mdlSchema = ModelInstance.getModelSchema(mdlInst);
  return mdlSchema.namePath() + '|' + mdlInst.id();
};

KvSerializer.prototype.decodeModelKey = function(key) {
  var delimIdx = key.indexOf('|');
  var id = key.substr(delimIdx + 1);
  return {
    namePath: key.substr(0, delimIdx),
    id: id
  };
};

KvSerializer.prototype._encodeModel = function(context, obj, includeType) {
  var objOut = {};

  var schema = obj.$.schema;

  if (includeType) {
    objOut._type = schema.namePath();
  }

  for (var i in obj) {
    /* istanbul ignore else */
    if (obj.hasOwnProperty(i)) {
      var field = schema.field(i);
      objOut[i] = this._encodeObject(context, field.type, obj[i]);
    }
  }

  return objOut;
};

// TODO: Provide better error details from failure cases (include field name)?
KvSerializer.prototype._encodeObject = function(context, type, obj) {
  if (type === Schema.MixedType) {
    if (obj instanceof ModelInstance) {
      return this._encodeModel(context, obj, true);
    } else if (obj instanceof Date) {
      type = Schema.DateType;
    } else if (Array.isArray(obj)) {
      // TODO: Make this better...
      var fakeType = new Schema.ListField();
      fakeType.type = Schema.MixedType;
    } else {
      return value;
    }
  }

  if (context.isModel(type)) {
    if (!(obj instanceof type)) {
      throw new Error('type mismatch');
    }

    return this._encodeModel(context, obj, false);
  } else if (type instanceof Schema.ListField) {
    if (!Array.isArray(obj)) {
      throw new Error('type mismatch');
    }

    var outArr = [];
    for (var i = 0; i < obj.length; ++i) {
      outArr[i] = this._encodeObject(context, type.type, obj[i]);
    }
    return outArr;
  } else if (type instanceof Schema.FieldGroup) {
    if (!(value instanceof Object)) {
      throw new Error('type mismatch');
    }

    var outObj = {};
    for (var j in value) {
      /* istanbul ignore else */
      if (value.hasOwnProperty(j)) {
        var field = type.field(i);
        if (!field) {
          throw new Error('Cannot find field data for property `' + j + '`.');
        }

        outObj[j] = this._encodeObject(context, field.type, value[j]);
      }
    }
    return outObj;
  } else if (type instanceof Schema.ModelRef) {
    if (!(obj instanceof ModelInstance)) {
      throw new Error('Expected ' + f.name + ' type to be a ModelInstance.');
    }

    var schema = obj.$.schema;

    // Values must match stated type names, unless the reference is to
    // 'Mixed', then any reference will do.
    if (type.name !== schema.name && (type.name !== 'Mixed')) {
      throw new Error('type mismatch');
    }

    return {
      '_type': schema.namePath(),
      '$ref': obj.id()
    };
  } else if (type === Schema.DateType) {
    if (!(obj instanceof Date)) {
      // TODO: Is this really the right behaviour???
      obj = new Date(obj);
    }

    try {
      return obj.toISOString();
    } catch (err) {
      throw new Error('invalid date format');
    }
  } else if (type === Schema.StringType) {
    if (obj !== undefined && typeof obj !== 'string') {
      throw new Error('type mismatch');
    }

    return obj;
  } else if (type === Schema.IntegerType) {
    // TODO: Integer validation
    if (obj !== undefined && typeof obj !== 'number') {
      throw new Error('type mismatch');
    }

    return obj;
  } else if (type === Schema.NumberType) {
    if (obj !== undefined && typeof obj !== 'number') {
      throw new Error('type mismatch');
    }

    return obj;
  } else if (type === Schema.BooleanType) {
    if (obj !== undefined && typeof obj !== 'boolean') {
      throw new Error('type mismatch');
    }

    return obj;
  } else {
    throw new Error('unknown type');
  }
};

KvSerializer.prototype.serializeModel = function(context, mdlInst) {
  return this._encodeObject(context, Schema.MixedType, mdlInst);
};

KvSerializer.prototype._decodeModelInto = function(context, TypeClass, data, outObj) {
  for (var i in data) {
    /* istanbul ignore else */
    if (data.hasOwnProperty(i)) {
      if (i === '_type') {
        continue;
      }

      var field = TypeClass.schema.field(i);
      if (!field) {
        throw new Error('unexpected field data');
      }

      outObj[i] = this._decodeObject(context, field.type, data[i]);
    }
  }
};

KvSerializer.prototype._decodeModel = function(context, TypeClass, data) {
  var ctorData = {};
  this._decodeModelInto(context, TypeClass, data, ctorData);
  return new TypeClass(ctorData);
};

KvSerializer.prototype._decodeObject = function(context, type, data) {
  if (data instanceof Object && data.$ref) {
    if (type === Schema.MixedType) {
      if (data._type) {
        type = new Schema.ModelRef(data._type);
      } else {
        throw new Error('missing type data in mixed reference');
      }
    } else {
      if (!(type instanceof Schema.ModelRef) || type.name !== data._type) {
        throw new Error('type mismatch');
      }
    }

    var modelTypeClass = context.typeByName(type.name);
    return modelTypeClass.ref(data.$ref);
  }

  if (data instanceof Object && data._type) {
    var modelType = context.typeByName(data._type);
    if (!modelType) {
      throw new Error('encountered unregistered type (' + data._type + ')');
    }

    if (type === Schema.MixedType) {
      type = modelType;
    } else {
      if (type !== modelType) {
        throw new Error('type mismatch');
      }
    }
  }

  if (type === Schema.MixedType) {
    if (data instanceof Object) {
      var objOut = {};

      for (var i in data) {
        /* istanbul ignore else */
        if (data.hasOwnProperty(i)) {
          objOut[i] = this._decodeObject(context, Schema.MixedType, data[i]);
        }
      }

      return objOut;
    } else if (Array.isArray(data)) {
      var objOut = [];

      for (var i = 0; i < data.length; ++i) {
        objOut[i] = this._decodeObject(context, Schema.MixedType, data[i]);
      }

      return objOut;
    } else {
      return data;
    }
  }

  if (Array.isArray(data)) {
    if (type instanceof Schema.ListField) {
      var objOut = [];

      for (var i = 0; i < data.length; ++i) {
        objOut[i] = this._decodeObject(context, type.type, data[i]);
      }

      return objOut;
    } else {
      throw new Error('type mismatch');
    }
  } else if (data instanceof Object) {
    if (context.isModel(type)) {
      return this._decodeModel(context, type, data);
    } else {
      throw new Error('type mismatch');
    }
  } else if (typeof data === 'string') {
    if (type === Schema.StringType) {
      return data;
    } else if (type === Schema.DateType) {
      return new Date(data);
    } else {
      throw new Error('type mismatch');
    }
  } else if (typeof data === 'number') {
    if (type === Schema.NumberType) {
      return data;
    } else if (type === Schema.IntegerType) {
      // TODO: Probably should do further validation here
      return data;
    } else {
      throw new Error('type mismatch');
    }
  } else if (typeof data === 'boolean') {
    if (type === Schema.BooleanType) {
      return value;
    } else {
      throw new Error('type mismatch');
    }
  } else {
    throw new Error('unexpected type');
  }

};

KvSerializer.prototype.deserializeModel = function(context, data) {
  return this._decodeObject(context, Schema.MixedType, data);
};

KvSerializer.prototype.deserializeModelInto = function(context, data, mdlInst) {
  if (!(mdlInst instanceof ModelInstance)) {
    throw new Error('Must pass a model instance type');
  }

  if (data._type) {
    var mdlSchema = ModelInstance.getModelSchema(mdlInst);

    if (data._type !== mdlSchema.name) {
      throw new Error('type mismatch');
    }
  }

  this._decodeModelInto(context, mdlInst.constructor, data, mdlInst);
};

module.exports = KvSerializer;

