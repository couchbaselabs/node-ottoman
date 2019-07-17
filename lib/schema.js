const util = require('util');
const ottopath = require('./ottopath');
const StoreAdapter = require('./storeadapter');

const SearchConsistency = StoreAdapter.SearchConsistency;

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
  return `CoreType(${this.type})`;
};
const stringCoreType = new CoreType('string');
const numberCoreType = new CoreType('number');
const integerCoreType = new CoreType('integer');
const boolCoreType = new CoreType('boolean');
const dateCoreType = new CoreType('Date');
const mixedCoreType = new CoreType('Mixed');

function ModelRef(name) {
  this.name = name;
}
ModelRef.prototype.inspect = function() {
  return `ModelRef(${this.name})`;
};

function ListField(type) {
  this.type = type;
}
ListField.prototype.inspect = function() {
  return `ListField(${util.inspect(this.type)})`;
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
  for (let i = 0; i < a.fields.length; ++i) {
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

// This function is private so the API can run the pre/post handlers
Schema.prototype._validate = function(mdlInst) {
  // Anything which is a fieldGroup causes a DFS of the trees to validate
  // any validators which are child elements in the tree
  var validateTree = function(field, instSubTree) {
    let current = null;
    if (instSubTree) {
      // instance might have a null subtree, but still needs validation
      current = instSubTree[field.name];
    }
    if (field.validator) {
      field.validator(current);
    } else if (field.type instanceof FieldGroup) {
      for (let j = 0; j < field.type.fields.length; ++j) {
        const child = field.type.fields[j];
        validateTree(child, current);
      }
    }
  };
  for (let i = 0; i < this.fields.length; ++i) {
    const field = this.fields[i];
    validateTree(field, mdlInst);
  }
};

Schema.prototype.validate = function(mdlInst, callback) {
  const self = this;
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
  const fieldKeys = [];
  for (let i = 0; i < fields.length; ++i) {
    fieldKeys.push(fields[i].replace(/\./g, '::'));
  }
  return `${this.namePath()}$${fieldKeys.join('$')}`;
};

Schema.prototype.refKeyPrefix = function(fields) {
  return `$${this.indexName(fields)}`;
};

Schema.prototype.refKey = function(fields, values) {
  return `${this.refKeyPrefix(fields)}|${values.join('|')}`;
};

Schema.prototype.refKeys = function(mdl) {
  // Find all the refkey indexes associated with this model.
  const refIndices = [];
  for (let k = 0; k < this.indices.length; ++k) {
    const index = this.indices[k];
    if (!(index instanceof RefDocIndex)) {
      continue;
    }
    refIndices.push(index);
  }

  // We only need to be loaded if there are actually reference
  // keys associated with this model to generate, do an early-out
  // if there are no reference key indices.
  if (refIndices.length <= 0) {
    return [];
  }

  // Ensure we are loaded, otherwise we will not have the needed model
  //  data that is used to generate the reference keys.
  if (!mdl.$.loaded) {
    throw new Error('Cannot generate reference keys for an unloaded object.');
  }

  // Generate all our reference keys
  const refKeys = [];
  for (let i = 0; i < refIndices.length; ++i) {
    const refIndex = refIndices[i];
    let refValues = [];
    for (let j = 0; j < refIndex.fields.length; ++j) {
      const value = this.fieldVal(mdl, refIndex.fields[j]);
      // Prevents refdoc keys from having "undefined" values
      if (value === undefined) {
        refValues = [];
        break;
      }
      refValues.push(value);
    }
    // only if there were defined values should the refkey go through
    // this allows any number of null values to be stored without colliding
    if (refValues.length > 0) {
      refKeys.push(this.refKey(refIndex.fields, refValues));
    }
  }
  return refKeys;
};

Schema.prototype.addIndex = function(index) {
  for (let i = 0; i < this.indices.length; ++i) {
    const oldIndex = this.indices[i];
    if (_matchIndexes(oldIndex, index)) {
      return;
    }
  }

  this.indices.push(index);
};

Schema.prototype.addDefIndexFn = function(name, indexDef) {
  let fields = indexDef.by;
  if (!Array.isArray(fields)) {
    fields = [fields];
  }

  const index = new SchemaIndex();
  index.type = indexDef.type;
  index.schema = this;
  index.fields = fields;
  this.addIndex(index);

  const rdifn = new SchemaIndexFn();
  rdifn.type = indexDef.type;
  rdifn.name = name;
  rdifn.fields = fields;
  rdifn.consistency = indexDef.consistency;
  this.indexFns.push(rdifn);
};

Schema.prototype.addRefDocIndexFn = function(name, indexDef) {
  let fields = indexDef.by;
  if (!Array.isArray(fields)) {
    fields = [fields];
  }

  if (
    indexDef.consistency !== undefined &&
    indexDef.consistency !== SearchConsistency.GLOBAL
  ) {
    throw new Error('Cannot define refdoc index with non-global consistency.');
  }

  const index = new RefDocIndex();
  index.schema = this;
  index.fields = fields;
  this.addIndex(index);

  const rdifn = new RefDocIndexFn();
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
  const remoteTypeName = queryDef.of;
  const remoteField = queryDef.by;

  const remoteType = this.context.typeByName(remoteTypeName);
  if (!remoteType) {
    this.context._delayBind(
      remoteTypeName,
      this._tryAddDefQueryFn.bind(this, name, queryDef)
    );
    return;
  }

  const remoteSchema = remoteType.schema;

  const index = new SchemaIndex();
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

  const vqfn = new ViewQueryFn();
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
    const idField = this.field(this.idField);
    if (!idField) {
      throw new Error(
        `Field \`${path}\` specified for id of model \`${this.name}\` does not exist.`
      );
    }
    if (!idField.readonly) {
      throw new Error(
        `Field \`${path}\` specified for id of model \`${this.name}\` must be readonly.`
      );
    }
  }
};

function _findField(fields, name) {
  for (let i = 0; i < fields.length; ++i) {
    if (fields[i].name === name) {
      return fields[i];
    }
  }
  return null;
}

Schema.prototype.fieldVal = function(mdl, name) {
  return eval(
    // jshint -W061
    `mdl.${name}`
  );
};

function _fieldSearch(context, fields, name) {
  const parts = name.split('.');
  const lclPart = parts.shift();

  for (let i = 0; i < fields.length; ++i) {
    const field = fields[i];
    if (field.name === lclPart) {
      if (parts.length === 0) {
        return field;
      }
      if (context.isModel(field.type)) {
        // TODO: This may not actually be good to have here...
        return field.type.schema.field(parts.join('.'));
      }
      if (field.type instanceof FieldGroup) {
        return _fieldSearch(context, field.type.fields, parts.join('.'));
      }
      if (field.type instanceof ModelRef) {
        throw new Error('Path cannot refer through reference type.');
      } else {
        throw new Error('Invalid path specified.');
      }
    }
  }
  return null;
}

Schema.prototype.field = function(name) {
  return _fieldSearch(this.context, this.fields, name);
};

function _fieldTypeSearchNamedFields(fields, fieldName) {
  const field = _findField(fields, fieldName);
  if (field) {
    return field.type;
  }
  return null;
}

function _fieldTypeSearchNamed(obj, fieldName, context) {
  if (context.isModel(obj)) {
    return _fieldTypeSearchNamed(obj.schema, fieldName, context);
  }

  if (obj instanceof Schema) {
    return _fieldTypeSearchNamedFields(obj.fields, fieldName);
  }
  if (obj instanceof FieldGroup) {
    return _fieldTypeSearchNamedFields(obj.fields, fieldName);
  }
  throw new Error('Unexpected pathing object type.');
}

function _fieldTypeSearchWildcard(obj) {
  if (obj instanceof ListField) {
    return obj.type;
  }
  throw new Error('Path does not match Schema for wildcard array access.');
}

function _decodeValue(context, type, data) {
  if (data instanceof Object && data.$ref) {
    if (!(type instanceof ModelRef)) {
      throw new Error(
        'Field looks like a reference, but model does not agree!'
      );
    }

    let modelType = context.typeByName(type.name);
    // TODO: This should probably be checked earlier than this!
    if (!modelType) {
      throw new Error(`Invalid type specified (${type.name})`);
    }

    if (
      (modelType.type && modelType.type === 'Mixed') ||
      modelType === Schema.Mixed
    ) {
      // This is a mixed type reference, so we have to get the type from
      // the **reference**, not from the defined model type (Mixed)
      modelType = context.typeByName(data._type);

      if (!modelType) {
        throw new Error(`Invalid type in mixed reference (${data._type})`);
      }
    }

    return modelType.ref(data.$ref);
  }
  if (data instanceof Object && data._type) {
    if (type === mixedCoreType) {
      type = context.typeByName(data._type);
      if (!type) {
        throw new Error('Could not deduce mixed type from data.');
      }
    }

    return type.fromData(data);
  }
  if (type instanceof CoreType) {
    if (type === dateCoreType) {
      return new Date(data);
    }
    return data;
  }
  if (context.isModel(type)) {
    return type.fromData(data);
  }
  if (type instanceof ListField) {
    if (!Array.isArray(data)) {
      throw new Error('Encountered a list field, but the data does not agree!');
    }

    const outArr = [];
    for (let i = 0; i < data.length; ++i) {
      outArr[i] = _decodeValue(context, type.type, data[i]);
    }
    return outArr;
  }
  if (type instanceof FieldGroup) {
    if (!(data instanceof Object)) {
      throw new Error(
        'Encountered a group field, but the data does not agree!'
      );
    }

    const outObj = {};
    /* eslint-disable no-use-before-define */
    _decodeFields(context, type.fields, outObj, data);
    /* eslint-enable no-use-before-define */
    return outObj;
  }
  if (type instanceof ModelRef) {
    throw new Error(
      'Encountered a ModelRef field, but the data does not agree!'
    );
  } else {
    throw new Error('Unknown field type.');
  }
}

function _decodeFields(context, fields, obj, data) {
  for (const i in data) {
    if (data.hasOwnProperty(i)) {
      if (i === '_type') {
        continue;
      }

      const field = _findField(fields, i);
      if (!field) {
        throw new Error(`Could not find schema field for \`${i}\`.`);
      }

      obj[i] = _decodeValue(context, field.type, data[i]);
    }
  }
}

function _decodeUserFields(context, fields, obj, data) {
  for (const i in data) {
    if (data.hasOwnProperty(i)) {
      const field = _findField(fields, i);
      if (!field) {
        throw new Error(`Could not find schema field for \`${i}\`.`);
      }

      /* eslint-disable no-use-before-define */
      obj[i] = _decodeUserValue(context, field.type, data[i]);
      /* eslint-enable no-use-before-define */
    }
  }
}

function _decodeUserValue(context, type, data) {
  if (type instanceof CoreType) {
    if (type === dateCoreType) {
      return new Date(data);
    }
    return data;
  }
  if (context.isModel(type)) {
    const TypeCtor = type;
    return new TypeCtor(data);
  }
  if (type instanceof ListField) {
    if (!Array.isArray(data)) {
      throw new Error('Encountered a list field, but the data does not agree!');
    }

    const outArr = [];
    for (let i = 0; i < data.length; ++i) {
      outArr[i] = _decodeUserValue(context, type.type, data[i]);
    }
    return outArr;
  }
  if (type instanceof FieldGroup) {
    if (!(data instanceof Object)) {
      throw new Error(
        'Encountered a group field, but the data does not agree!'
      );
    }

    const outObj = {};
    _decodeUserFields(context, type.fields, outObj, data);
    return outObj;
  }
  if (type instanceof ModelRef) {
    const expectedType = context.typeByName(type.name);

    if (type.name === 'Mixed' || expectedType === Schema.Mixed) {
      // Pass; mixed references are permitted.
    } else if (!(data instanceof expectedType)) {
      throw new Error(
        `Expected value to be a ModelInstance of type \`${type.name}\`.`
      );
    }
    return data;
  }
  throw new Error('Unknown field type.');
}

function _fieldTypeSearch(obj, pathObj, context) {
  if (pathObj.operation === 'member') {
    if (pathObj.expression.type !== 'identifier') {
      throw new Error('Unexpected expression type for member operation.');
    }
    return _fieldTypeSearchNamed(obj, pathObj.expression.value, context);
  }
  if (pathObj.operation === 'subscript') {
    if (pathObj.expression.type === 'string_literal') {
      return _fieldTypeSearchNamed(obj, pathObj.expression.value, context);
    }
    if (pathObj.expression.type === 'wildcard') {
      return _fieldTypeSearchWildcard(obj, context);
    }
    throw new Error('Unexpected subscript expression type.');
  } else {
    throw new Error('Unexpected path operation type.');
  }
}

Schema.prototype.fieldType = function(path) {
  let obj = this;

  const pathArr = ottopath.parse(path);
  for (let i = 0; i < pathArr.length; ++i) {
    if (!obj) {
      throw new Error('Invalid path specified.');
    }
    obj = _fieldTypeSearch(obj, pathArr[i], this.context);
  }
  return obj;
};

Schema.prototype.applyDataToObject = function(obj, data) {
  _decodeFields(this.context, this.fields, obj, data);
};

Schema.prototype.applyUserDataToObject = function(obj, data) {
  _decodeUserFields(this.context, this.fields, obj, data);
};

Schema.prototype.applyDefaultsToObject = function(obj) {
  for (let i = 0; i < this.fields.length; ++i) {
    const field = this.fields[i];

    if (field.type instanceof FieldGroup) {
      obj[field.name] = field.type.create();
    } else if (field.type instanceof ListField) {
      obj[field.name] = [];
    } else if (field.default instanceof Function) {
      obj[field.name] = field.default();
    } else if (field.default !== undefined) {
      obj[field.name] = field.default;
    }
  }
};

Schema.prototype.applyPropsToObj = function(obj) {
  for (let i = 0; i < this.fields.length; ++i) {
    const field = this.fields[i];

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

  const preHandlers = this.preHandlers[event];
  let i = 0;
  var doNext = function _doNextPreHandler(err) {
    // If any one of the pre-handlers fails, fail the whole thing.
    // This allows people to plug in additional validation.
    if (err) {
      return callback(err);
    }

    if (i === preHandlers.length) {
      callback(null);
      return;
    }

    const curI = i;
    i++;

    preHandlers[curI].call(mdlInst, mdlInst, doNext);
  };
  doNext();
};

Schema.prototype.execPostHandlers = function(event, mdlInst, callback) {
  if (!this.postHandlers[event]) {
    callback(null);
    return;
  }

  try {
    const postHandlers = this.postHandlers[event];
    for (let i = 0; i < postHandlers.length; ++i) {
      // After an action has taken place we don't really
      // need this callback, but we will add it for consistency
      // in the API: post handlers should expect to always get
      // 2 arguments, mdlInst and callback.
      const doNext = function() {};

      postHandlers[i].call(mdlInst, mdlInst, doNext);
    }

    callback(null);
  } catch (e) {
    callback(e);
  }
};

const supportedEvents = ['validate', 'save', 'load', 'remove'];

Schema.prototype.addPreHandler = function(event, callback) {
  if (supportedEvents.indexOf(event) === -1) {
    throw new Error(`Unsupported event type \`${event}\`.`);
  }
  if (!this.preHandlers[event]) {
    this.preHandlers[event] = [];
  }
  this.preHandlers[event].push(callback);
};

Schema.prototype.addPostHandler = function(event, fn) {
  if (supportedEvents.indexOf(event) === -1) {
    throw new Error(`Unsupported event type \`${event}\`.`);
  }
  if (!this.postHandlers[event]) {
    this.postHandlers[event] = [];
  }
  this.postHandlers[event].push(fn);
};

const _typeByNameLkp = {
  string: stringCoreType,
  number: numberCoreType,
  integer: integerCoreType,
  boolean: boolCoreType,
  Date: dateCoreType,
  Mixed: mixedCoreType
};
Schema.coreTypeByName = function(type) {
  const coreType = _typeByNameLkp[type];
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
