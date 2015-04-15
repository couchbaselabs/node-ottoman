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
  mdlInst.save(callback);
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
      if ($.schema.context.isModel(field.type)) {
        if (!(this[i] instanceof field.type)) {
          throw new Error('Expected property `' + i + '` to be of type `' + field.type.name + '`');
        }
        objOut[i] = this[i]._toJSON(field.type.name, forceTyping);
      } else if (field.type instanceof Schema.ModelRef) {
        if (!(this[i] instanceof ModelInstance)) {
          throw new Error('Expected property `' + i + '` to be a ModelInstance.');
        }
        if (field.type.name !== this[i].$.schema.name) {
          throw new Error('Expected property `' + i + '` to be of type `' +
          field.type.name + '` (got `' + this[i].$.schema.name + '`)');
        }
        objOut[i] = {
          '_type': this[i].$.schema.namePath(),
          '$ref': this[i].id()
        };
      } else if (field.type === Schema.DateType) {
        if ((!this[i] instanceof Date)) {
          throw new Error('Expected property `' + i + '` to be a Date.');
        }
        objOut[i] = this[i].toISOString();
      } else if (field.type === Schema.MixedType) {
        if (this[i] instanceof ModelInstance) {
          objOut[i] = this[i]._toJSON(field.type.name, forceTyping);
        } else if (this[i] instanceof Date) {
          objOut[i] = {
            '_type': 'Date',
            'v': this[i].toISOString()
          };
        } else {
          objOut[i] = this[i];
        }
      } else {
        if (this[i] instanceof Object) {
          throw new Error('Expected non-object type but got object.');
        }
        objOut[i] = this[i];
      }
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

ModelInstance.prototype.load = function(callback) {
  var $ = this.$;
  var self = this;
  var key = _modelKey(this);
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
