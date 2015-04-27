var util = require('util');
var Schema = require('./schema');
var couchbase = require('couchbase');

function ModelData() {
  this.key = null;
  this.data = null;
  this.cas = null;
}

function ModelRefData() {
  this.key = null;
}

function ModelInstance(schema, args) {
  var $ = this.$ = {};
  Object.defineProperty(this, "$", {
    enumerable: false
  });

  $.schema = schema;
  $.key = null;
  $.cas = null;
  $.loaded = false;
  $.refKeys = [];

  if (args.length === 1 && args[0] instanceof ModelData) {
    $.key = args[0].key;
    ModelInstance.applyData(this, args[0]);
  } else if (args.length == 1 && args[0] instanceof ModelRefData) {
    $.key = args[0].key;
  } else {
    $.schema.applyDefaultsToObject(this);
    $.schema.applyPropsToObj(this);
    $.loaded = true;
  }
};

ModelInstance.fromData = function(data) {
  var md = new ModelData();
  md.data = data;

  var mdlInstance = new this(md);
  return mdlInstance;
};

ModelInstance.applyData = function(mdlInst, data) {
  if (!data instanceof ModelData) {
    throw new Error('ApplyData must be called with ModelData instance.');
  }

  var $ = mdlInst.$;
  if ($.key !== null && $.key !== data.key) {
    throw new Error('Tried to load data from wrong id.');
  }
  $.key = data.key;
  $.schema.applyDataToObject(mdlInst, data.data);
  $.cas = data.cas;
  $.loaded = true;
  $.refKeys = $.schema.refKeys(mdlInst);
};

ModelInstance.create = function(opts, callback) {
  var mdlInst = new this();
  for (var i in opts) {
    if (opts.hasOwnProperty(i)) {
      mdlInst[i] = opts[i];
    }
  }
  mdlInst.save(function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, mdlInst);
  });
};

ModelInstance.namePath = function() {
  return this.schema.namePath();
};

ModelInstance.prototype.loaded = function() {
  return this.$.loaded;
};

function _modelKey(mdl) {
  if (mdl.loaded()) {
    // Force key generation
    mdl.id();
  }
  // Return the key
  return mdl.$.key;
}

ModelInstance.prototype.id = function() {
  var $ = this.$;
  if (!$.loaded) {
    return $.key;
  }
  var myId = eval('this.' + this.$.schema.idField);
  var newKey = $.schema.namePath() + '|' + myId;
  if ($.key !== null) {
    if ($.key !== newKey) {
      throw new Error('The Key of the object has changed!');
    }
  } else {
    $.key = newKey;
  }
  return myId;
};

function _findField(fields, name) {
  for (var i = 0; i < fields.length; ++i) {
    if (fields[i].name === name) {
      return fields[i];
    }
  }
  return null;
}

function _encodeValue(context, type, value, forceTyping) {
  if (context.isModel(type)) {
    if (!(value instanceof type)) {
      throw new Error('Expected type to be a `' + type.name + '`');
    }
    return value._toJSON(type.name, forceTyping);
  } else if (type instanceof Schema.ListField) {
    if (!Array.isArray(value)) {
      throw new Error('Expected type to be an array.');
    }
    var outArr = [];
    for (var i = 0; i < value.length; ++i) {
      outArr[i] = _encodeValue(context, type.type, value[i], forceTyping);
    }
    return outArr;
  } else if (type instanceof Schema.FieldGroup) {
    if (!(value instanceof Object)) {
      throw new Error('Expected object type but got non-object.');
    }
    var outObj = {};
    for (var i in value) {
      if (value.hasOwnProperty(i)) {
        var field = _findField(type.fields, i);
        if (!field) {
          throw new Error('Cannot find field data for property `' + i + '`.');
        }
        outObj[i] = _encodeValue(context, field.type, value[i], forceTyping);
      }
    }
    return outObj;
  } else if (type instanceof Schema.ModelRef) {
    if (!(value instanceof ModelInstance)) {
      throw new Error('Expected type to be a ModelInstance.');
    }
    if (type.name !== value.$.schema.name) {
      throw new Error('Expected type to be `' +
      type.name + '` (got `' + value.$.schema.name + '`)');
    }
    return {
      '_type': value.$.schema.namePath(),
      '$ref': value.id()
    };
  } else if (type === Schema.DateType) {
    if (!(value instanceof Date)) {
      throw new Error('Expected type to be a Date.');
    }
    return value.toISOString();
  } else if (type === Schema.MixedType) {
    if (value instanceof ModelInstance) {
      return value._toJSON(type.name, forceTyping);
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
      throw new Error('Expected non-object type but got object.');
    }
    return value;
  }
}

ModelInstance.prototype._toJSON = function(refType, forceTyping) {
  var $ = this.$;
  var objOut = {};

  if (forceTyping || this.$.schema.name !== refType) {
    objOut._type = this.$.schema.namePath();
  }

  for (var i in this) {
    /* istanbul ignore else */
    if (this.hasOwnProperty(i)) {
      var field = $.schema.field(i);
      objOut[i] =
          _encodeValue($.schema.context, field.type, this[i], forceTyping);
    }
  }
  return objOut;
};

ModelInstance.prototype.toJSON = function() {
  return this._toJSON('Mixed', false);
};

ModelInstance.prototype.inspect = function(depth) {
  var res = '';
  var name = this.$.schema.name;
  if (!name) {
    name = 'unnamed';
  }
  var attribs = [];
  if (this.$.loaded) {
    attribs.push('loaded');
  } else {
    attribs.push('unloaded');
  }
  attribs.push('key:' + this.$.key);

  res += 'OttomanModel(`' + name + '`, ' + attribs.join(', ') + ', {';
  var hasProperties = false;
  for (var i in this) {
    if (this.hasOwnProperty(i)) {
      if (!hasProperties) {
        res += "\n";
        hasProperties = true;
      }
      res += '  ' + i + ': ';
      res += util.inspect(this[i]).replace(/\n/g, "\n  ");
      res += ",\n";
    }
  }
  res += '})';
  return res;
};

function _tryAddRefs(bucket, keys, refKey, callback) {
  if (keys.length === 0) {
    callback(null);
    return;
  }
  var errs = [];
  var i = 0;
  function stepBackward() {
    if (i === -1) {
      if (errs.length > 1) {
        var err = new Error('CRITICAL Error occured while storing refdoc, then roll-back errored as well.');
        err.errors = errs;
        callback(err);
      } else {
        callback(errs[0]);
      }
      return;
    }
    var key = keys[i--];
    bucket.remove(key, null, function(err) {
      if (err) {
        errs.push(err);
      }
      stepBackward();
    });
  }
  function stepForward() {
    if (i === keys.length) {
      callback(null);
      return;
    }
    var key = keys[i++];
    bucket.store(key, refKey, null, function(err) {
      if (err) {
        errs.push(err);
        --i;
        stepBackward();
        return;
      }
      stepForward();
    });
  }
  stepForward();
}

function _tryRemoveRefs(bucket, keys, callback) {
  if (keys.length === 0) {
    callback(null);
    return;
  }
  var proced = 0;
  for (var i = 0; i < keys.length; ++i) {
    bucket.remove(keys[i], null, function() {
      proced++;
      if (proced === keys.length) {
        callback(null);
        return;
      }
    });
  }
}

ModelInstance.prototype.save = function(callback) {
  var self = this;
  var $ = this.$;
  var newKey = _modelKey(this);
  var newData = this.toJSON();
  var newRefKeys = $.schema.refKeys(this);

  var oldRefKeys = $.refKeys;
  var addedRefKeys = [];
  var removedRefKeys = [];
  for (var i = 0; i < newRefKeys.length; ++i) {
    if (oldRefKeys.indexOf(newRefKeys[i]) === -1) {
      addedRefKeys.push(newRefKeys[i]);
    }
  }
  for (var i = 0; i < oldRefKeys.length; ++i) {
    if (newRefKeys.indexOf(oldRefKeys[i]) === -1) {
      removedRefKeys.push(oldRefKeys[i]);
    }
  }

  // Attempt to validate this object
  $.schema.validate(this, function(err) {
    if (err) {
      callback(err);
      return;
    }

    $.schema.execPreHandlers('save', this, function(err) {
      if (err) {
        callback(err);
        return;
      }

      _tryAddRefs($.schema.store, addedRefKeys, $.key, function(err) {
        if (err) {
          callback(err);
          return;
        }

        $.schema.store.store(newKey, newData, $.cas, function(err, cas) {
          if (err) {
            callback(err);
            return;
          }

          $.cas = cas;
          $.refKeys = newRefKeys;

          _tryRemoveRefs($.schema.store, removedRefKeys, function(err) {
            if (err) {
              callback(err);
              return;
            }

            $.schema.execPostHandlers('save', self, callback);
          });
        });
      });
    });
  });
};

ModelInstance.prototype.load = function() {
  var loadItems = [];
  var callback = function() {};
  for (var i = 0; i < arguments.length; ++i) {
    if (arguments[i] instanceof Function) {
      callback = arguments[i];
      break;
    } else {
      loadItems.push(arguments[i]);
    }
  }

  if (!this.loaded()) {
    var foundThis = false;
    for (var i = 0; i < loadItems.length; ++i) {
      if (loadItems[i] === '') {
        foundThis = true;
        break;
      }
    }
    if (!foundThis) {
      loadItems.unshift('');
    }
  }

  if (loadItems.length === 0) {
    loadItems = [''];
  }

  var self = this;
  var $ = self.$;
  function loadThis(callback) {
    var key = _modelKey(self);
    $.schema.store.get(key, function(err, data, cas) {
      if (err) {
        callback(err);
        return;
      }

      var md = new ModelData();
      md.key = $.key;
      md.data = data;
      md.cas = cas;
      ModelInstance.applyData(self, md);
      callback(null);
    });
  }

  (function loadOne(err) {
    if (err) {
      callback(err);
      return;
    }

    if (loadItems.length === 0) {
      callback(null);
      return;
    }

    var loadItem = loadItems.shift();
    if (loadItem === '') {
      loadThis(loadOne);
    } else {
      var itemVal = $.schema.fieldVal(self, loadItem);
      if (itemVal) {
        itemVal.load(loadOne);
      } else {
        loadOne(null);
      }
    }
  })(null);
};

ModelInstance.prototype.remove = function(callback) {
  var $ = this.$;
  var key = _modelKey(this);
  $.schema.store.remove(key, function(err) {
    if (err) {
      callback(err);
      return;
    }

    callback(null);
  });
};

ModelInstance.getById = function(id, callback) {
  var mdl = this.ref(id);
  mdl.load(function(err) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, mdl);
  });
};

ModelInstance.refByKey = function(key) {
  var mr = new ModelRefData();
  mr.key = key;
  return new this(mr);
};

ModelInstance.ref = function(id) {
  return this.refByKey(this.schema.namePath() + '|' + id);
};

ModelInstance.pre = function(event, callback) {
  return this.schema.addPreHandler(event, callback);
};

ModelInstance.post = function(event, fn) {
  return this.schema.addPostHandler(event, fn);
};

module.exports = ModelInstance;
