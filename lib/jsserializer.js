'use strict';

var ModelInstance = require('./modelinstance');
var Schema = require('./schema');

var _ = require('lodash');
_.mixin(require('lodash-deep'));

// TODO: This entire class is fucking laughable...

function JsSerializer() {
}

function _findField(fields, name) {
  for (var i = 0; i < fields.length; ++i) {
    if (fields[i].name === name) {
      return fields[i];
    }
  }
  return null;
}

function _encodeValue(context, type, value, forceTyping, f) {
  if (context.isModel(type)) {
    if (!(value instanceof type)) {
      throw new Error('Expected ' + f.name + ' type to be a `' +
        type.name + '`');
    }
    return value._toCoo(type.name, forceTyping);
  } else if (type instanceof Schema.ListField) {
    if (!Array.isArray(value)) {
      throw new Error('Expected ' + f.name + ' type to be an array.');
    }
    var outArr = [];
    for (var i = 0; i < value.length; ++i) {
      outArr[i] = _encodeValue(context, type.type, value[i], forceTyping, f);
    }
    return outArr;
  } else if (type instanceof Schema.FieldGroup) {
    if (!(value instanceof Object)) {
      throw new Error('Expected ' + f.name +
        ' object type but got non-object.');
    }
    var outObj = {};
    for (var j in value) {
      /* istanbul ignore else */
      if (value.hasOwnProperty(j)) {
        var field = _findField(type.fields, j);
        if (!field) {
          throw new Error('Cannot find field data for property `' + j + '`.');
        }
        outObj[j] = _encodeValue(context, field.type, value[j],
          forceTyping, field);
      }
    }
    return outObj;
  } else if (type instanceof Schema.ModelRef) {
    if (!(value instanceof ModelInstance)) {
      throw new Error('Expected ' + f.name + ' type to be a ModelInstance.');
    }
    // Values must match stated type names, unless the reference is to
    // 'Mixed', then any reference will do.
    if (type.name !== value.$.schema.name && (type.name !== 'Mixed')) {
      throw new Error('Expected type to be `' +
        type.name + '` (got `' + value.$.schema.name + '`)');
    }
    return {
      '_type': value.$.schema.namePath(),
      '$ref': value.id()
    };
  } else if (type === Schema.DateType) {
    if (!(value instanceof Date)) {
      // throw new Error('Expected ' + f.name + ' type to be a Date.');
      value = new Date(value);
    }
    try {
      return value.toISOString();
    } catch (err) {
      console.error('Invalid date ' + value + ' in ' + f.name);
      return null;
    }
  } else if (type === Schema.MixedType) {
    if (value instanceof ModelInstance) {
      return value._toCoo(type.name, forceTyping);
    } else if (value instanceof Date) {
      return {
        '_type': 'Date',
        'v': value.toISOString()
      };
    } else {
      return value;
    }
  } else {
    if (value instanceof Object) {
      throw new Error('Expected ' + f.name + ' non-object type ' +
        JSON.stringify(type) + ' but got object.');
    }
    return value;
  }
}

function _encodeCoo(mdlInst, refType, forceTyping) {
  var $ = mdlInst.$;
  var objOut = {};

  if (forceTyping || mdlInst.$.schema.name !== refType) {
    objOut._type = mdlInst.$.schema.namePath();
  }

  for (var i in mdlInst) {
    /* istanbul ignore else */
    if (mdlInst.hasOwnProperty(i)) {
      var field = $.schema.field(i);
      objOut[i] =
        _encodeValue($.schema.context, field.type, mdlInst[i],
          forceTyping, field);
    }
  }
  return objOut;
}

JsSerializer.prototype.serializeModel = function(obj) {
  if (!obj.loaded()) {
    return null;
  }

  // Starting point matches the coo, which already converts into
  // an actual json object suitable for storage.
  var val = _encodeCoo(obj, 'Mixed', false);

  var refs = {};

  // Type designator is an internal that isn't part of JSON
  delete (val._type);

  // Substitute coo internals for exposable DBRef
  // Docs about ref structure:
  // https://docs.mongodb.com/manual/reference/database-references/
  // Requires lodash-deep mixin.
  // Ottoman doesn't have a convention for doing this other than its own coo
  // representation; so we choose this because it's familiar to js devs, and
  // extensible; in later versions of ottoman you can add a bucket designator in
  // mongoose's $db key
  _.deepMapValues(val, function (value, path) {
    // References in toCoo normally looks like this:
    // { $ref: 'some-model-id', _type: 'ModelName' }
    // Would prefer .endsWith over this match, but not available until es6.
    if (path.match(/\$ref$/)) {
      // Path here will be path.to.something.$ref
      var pathToRef = path.split('.');

      // Modify so that refs['path.to.something'] = a mongoose reference.
      pathToRef.pop();
      var modelType = _.get(val, pathToRef.join('.') + '._type');
      refs[pathToRef.join('.')] = {
        $ref: modelType,
        $id: value
      };
    }
    return value;
  });

  // Replace reference data structures with the simple ID findByOID
  // the object, friendlier for REST API.
  Object.keys(refs).forEach(function (pathToRef) {
    _.set(val, pathToRef, refs[pathToRef]);
  });

  return val;
};

module.exports = JsSerializer;
