'use strict';

var _ = require('lodash');
var KvSerializer = require('./kvserializer');
var ModelInstance = require('./modelinstance');
var StoreAdapter = require('./storeadapter');

function KvFilterer() {
}

KvFilterer.prototype.filter = function(filter) {
  throw new Error('not implemented');
};

KvFilterer.prototype.skip = function(amount) {
  throw new Error('not implemented');
};

KvFilterer.prototype.limit = function(amount) {
  throw new Error('not implemented');
};

KvFilterer.prototype.sortBy = function() {
  throw new Error('not implemented');
};

KvFilterer.prototype.fetchIds = function(callback) {
  throw new Error('not implemented');
};

KvFilterer.prototype.fetchCount = function(callback) {
  throw new Error('not implemented');
};

function _parseSortByArgs(args, part) {
  if (Array.isArray(part)) {
    for (var i = 0; i < part.length; ++i) {
      this._addOrderPart(part[i]);
    }
    return;
  }

  if (typeof part === 'string') {
    args.push({name: part});
  } else if (part instanceof Object) {
    for (var j in part) {
      if (part.hasOwnProperty(j)) {
        args.push({name: j, direction: part[j]});
      }
    }
  } else {
    throw new Error('unexpected ordering part type');
  }
}

KvFilterer.parseSortByArgs = function(args) {
  var sortBys = [];
  _parseSortByArgs(sortBys, args);
  return sortBys;
};

function KvStoreData() {
  this.cas = null;
  this.key = null;
  this.refKeys = [];
}

function KvStoreAdapter() {
  StoreAdapter.call(this);

  this.refdocs = {};
  this.serializer = new KvSerializer();
}

KvStoreAdapter.prototype._getStoreData = function(mdlInst) {
  var storeData = ModelInstance.getStoreData(mdlInst);

  if (!(storeData instanceof KvStoreData)) {
    storeData = new KvStoreData();
    ModelInstance.setStoreData(mdlInst, storeData);
  }

  return storeData;
};

KvStoreAdapter.prototype.load = function(mdlInst, callback) {
  // This is really just a safety precaution, we should never get here...
  if (mdlInst.loaded()) {
    throw new Error('attempted to load loaded model instance');
  }

  var storeData = this._getStoreData(mdlInst);
  var mdlSchema = ModelInstance.getModelSchema(mdlInst);

  var myKey = this.serializer.genModelKey(mdlInst);

  var self = this;

  this.kvGet(myKey, function(err, data, cas) {
    if (err) {
      callback(err);
      return;
    }

    self.serializer.deserializeModelInto(mdlSchema.context, data, mdlInst);
    ModelInstance.markLoaded(mdlInst);

    storeData.key = myKey;
    storeData.cas = cas;
    storeData.refKeys = self.serializer.genModelRefKeys(mdlInst);

    callback(null);
  });
};

KvStoreAdapter.prototype._tryAddRefs = function(keys, refKey, callback) {
  if (keys.length === 0) {
    callback(null);
    return;
  }

  var self = this;

  var errs = [];
  var i = 0;
  function stepBackward() {
    if (i === -1) {
      if (errs.length > 1) {
        var err = new Error('CRITICAL Error occured while storing refdoc.');
        err.errors = errs;
        callback(err);
      } else {
        callback(errs[0]);
      }
      return;
    }
    var key = keys[i--];
    self.kvRemove(key, null, function (err) {
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
    self.kvStore(key, refKey, null, function (err) {
      if (err) {
        errs.push(err);
        i -= 2;
        stepBackward();
        return;
      }
      stepForward();
    });
  }
  stepForward();
};

KvStoreAdapter.prototype._tryRemoveRefs = function(keys, callback) {
  if (keys.length === 0) {
    callback(null);
    return;
  }

  var self = this;

  var proced = 0;
  function handler() {
    proced++;
    if (proced === keys.length) {
      callback(null);
      return;
    }
  }
  for (var i = 0; i < keys.length; ++i) {
    self.kvRemove(keys[i], null, handler);
  }
};

KvStoreAdapter.prototype.store = function(mdlInst, callback) {
  // This is really just a safety precaution, we should never get here...
  if (!mdlInst.loaded()) {
    throw new Error('attempted to save unloaded model instance');
  }

  var storeData = this._getStoreData(mdlInst);

  var mdlSchema = ModelInstance.getModelSchema(mdlInst);

  var myKey = this.serializer.genModelKey(mdlInst);
  var data = this.serializer.serializeModel(mdlSchema.context, mdlInst);

  var refKeys = this.serializer.genModelRefKeys(mdlInst);
  var addedRefKeys = _.difference(refKeys, storeData.refKeys);
  var removedRefKeys = _.difference(storeData.refKeys, refKeys);

  var self = this;

  self._tryAddRefs(addedRefKeys, myKey, function(err) {
    if (err) {
      callback(err);
      return;
    }

    self.kvStore(myKey, data, storeData.cas, function(err, cas) {
      if (err) {
        callback(err);
        return;
      }

      storeData.cas = cas;

      // TODO: Rather than save these here, we should be doing it sequentially
      //  in the tryAddRefs and tryRemoveRefs functions, to keep our local state
      //  actually in sync with what the server has.  Error handling to come.
      storeData.refKeys = refKeys;

      self._tryRemoveRefs(removedRefKeys, function(err) {
        if (err) {
          callback(err);
          return;
        }

        callback(null);
      });
    })
  });
};

KvStoreAdapter.prototype.remove = function(mdlInst, callback) {
  var storeData = this._getStoreData(mdlInst);
  var myKey = this.serializer.genModelKey(mdlInst);

  var self = this;

  // Remove the document itself first, then remove any
  //  reference keys.  This order is important as if the
  //  reference keys fail to get removed, the references
  //  will at least still point to nothing.
  self.kvRemove(myKey, storeData.cas, function(err) {
    if (err) {
      callback(err);
      return;
    }

    self._tryRemoveRefs(storeData.refKeys, callback);
  });
};

/**
 * Performs a search against a view index.
 *
 * @param {string} type
 * @param {string} modelName
 * @param {string} name
 * @param {Object} options
 * @param {StoreAdapter~SearchCallback} callback
 * @private
 * @ignore
 */
KvStoreAdapter.prototype._searchRefdocIndex =
  function (type, model, fields, options, callback) {
    if (options.range) {
      callback(new Error(
        'Cannot query refdoc index by range!'), null);
      return;
    }

    var self = this;

    var refKey = this.serializer.genRefKey(model.schema.name, fields, options.key);
    self.kvGet(refKey, function(err, refKey, cas) {
      if (err) {
        if (self.isNotFoundError(err)) {
          callback(null, []);
          return;
        } else {
          callback(err, null);
          return;
        }
      }

      var refInfo = self.serializer.decodeModelKey(refKey);
      var refObj = model.ref(refInfo.id);

      callback(null, [refObj]);
    });
  };

KvStoreAdapter.prototype._normalizeFilter = function(filter) {
  if (filter instanceof ModelInstance) {
    return {
      '$ref': filter.id()
    };
  } else if (Array.isArray(filter)) {
    var out = [];
    for (var i = 0; i < filter.length; ++i) {
      out[i] = this._normalizeFilter(filter[i]);
    }
    return out;
  } else if (filter instanceof Object) {
    var out = {};
    for (var i in filter) {
      if (filter.hasOwnProperty(i)) {
        out[i] = this._normalizeFilter(filter[i]);
      }
    }
    return out;
  } else {
    return filter;
  }
};

KvStoreAdapter.prototype.isNotFoundError = function (err) {
  throw new Error('not implemented');
};

KvStoreAdapter.prototype.kvGet = function (key, callback) {
  throw new Error('not implemented');
};

KvStoreAdapter.prototype.kvStore = function (key, data, cas, callback) {
  throw new Error('not implemented');
};

KvStoreAdapter.prototype.kvRemove = function (key, cas, callback) {
  throw new Error('not implemented');
};

KvStoreAdapter.prototype.createIndex =
  function (type, model, fields, callback) {
    throw new Error('not implemented');
  };

KvStoreAdapter.prototype.ensureIndices = function (callback) {
  throw new Error('not implemented');
};

KvStoreAdapter.prototype.searchIndex =
  function (type, modelName, fields, options, callback) {
    throw new Error('not implemented');
  };

KvStoreAdapter.prototype.count =
  function (type, modelName, options, callback) {
    throw new Error('not implemented');
  };

KvStoreAdapter.prototype.find =
  function (type, modelName, options, callback) {
    throw new Error('not implemented');
  };

module.exports = KvStoreAdapter;
