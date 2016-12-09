'use strict';

var util = require('util');
var KvStoreAdapter = require('./kvstoreadapter');
var ModelInstance = require('./modelinstance');

var NOT_FOUND_ERR = new Error('Key was not found.');
var ALREADY_EXISTS_ERR = new Error('Key already exists.');
var CAS_MISMATCH_ERR = new Error('CAS does not match.');

function makeCas() {
  return Math.floor(Math.random() * 10000000);
}

function MockStoreAdapter() {
  KvStoreAdapter.call(this);

  this.data = {};
  this.indexes = {};
  this.debug = true;
}
util.inherits(MockStoreAdapter, KvStoreAdapter);

MockStoreAdapter.prototype.clear = function () {
  this.data = {};
};

MockStoreAdapter.prototype.isNotFoundError = function (err) {
  return err === NOT_FOUND_ERR;
};

MockStoreAdapter.prototype.kvGet = function (key, callback) {
  if (this.debug) {
    console.log('MockStoreAdapter::kvGet', key);
  }

  process.nextTick(function () {
    var keyData = this.data[key];
    if (keyData) {
      callback(null, keyData.value, keyData.cas);
      return;
    }

    callback(NOT_FOUND_ERR, null, null);
  }.bind(this));
};

MockStoreAdapter.prototype.kvStore = function (key, data, cas, callback) {
  if (this.debug) {
    console.log('MockStoreAdapter::kvStore', key, cas, data);
  }

  process.nextTick(function () {
    var keyData = this.data[key];
    if (cas) {
      if (keyData.cas !== cas) {
        callback(CAS_MISMATCH_ERR, null);
        return;
      }
    } else {
      if (keyData !== undefined) {
        callback(ALREADY_EXISTS_ERR, null);
        return;
      }
    }

    var newData = {
      cas: makeCas(),
      value: data
    };
    this.data[key] = newData;
    callback(null, newData.cas);
  }.bind(this));
};

MockStoreAdapter.prototype.kvRemove = function (key, cas, callback) {
  if (this.debug) {
    console.log('MockStoreAdapter::kvRemove', key, cas);
  }

  process.nextTick(function () {
    var keyData = this.data[key];
    if (cas) {
      if (keyData.cas !== cas) {
        callback(CAS_MISMATCH_ERR);
        return;
      }
    }

    delete this.data[key];
    callback();
  }.bind(this));
};

function _getIndexName(type, modelName, name) {
  return type + '|' + modelName + '|' + name;
}

var VALID_INDEX_TYPES = ['refdoc', 'n1ql', 'view'];

MockStoreAdapter.prototype.createIndex =
  function (type, model, fields, callback) {
    var modelName = model.schema.namePath();

    if (this.debug) {
      console.log('MockStoreAdapter::createIndex',
        type, modelName, fields);
    }

    var name = this.serializer.indexName(modelName, fields);

    process.nextTick(function () {
      if (VALID_INDEX_TYPES.indexOf(type) === -1) {
        callback(new Error('Invalid index type specified.'));
        return;
      }

      var indexKey = _getIndexName(type, modelName, name);
      this.indexes[indexKey] = fields;
      callback();
    }.bind(this));
  };

MockStoreAdapter.prototype.ensureIndices = function (callback) {
  if (this.debug) {
    console.log('MockStoreAdapter::ensureIndices');
  }

  process.nextTick(function () {
    callback();
  }.bind(this));
};

MockStoreAdapter.prototype.searchIndex =
  function (type, model, fields, options, callback) {
    var modelName = model.schema.name;

    if (this.debug) {
      console.log('MockStoreAdapter::searchIndex',
        type, modelName, fields, options);
    }

    if (type === 'refdoc') {
      return this._searchRefdocIndex(type, model, fields, options, callback);
    }

    var name = this.serializer.indexName(modelName, fields);

    process.nextTick(function () {
      var indexKey = _getIndexName(type, modelName, name);
      var indexInfo = this.indexes[indexKey];
      if (!indexInfo) {
        callback(new Error('Specified an invalid index to search.'));
        return;
      }

      if (options.key) {
        var filter = {};
        for (var i = 0; i < options.key.length; ++i) {
          filter[indexInfo[i]] = options.key[i];
        }
        delete options.key;
        options.filter = filter;
      }

      this.find(type, model, options, callback);
    }.bind(this));
  };

MockStoreAdapter.prototype.count =
  function (type, model, options, callback) {
    var modelName = model.schema.name;

    if (this.debug) {
      console.log('MockStoreAdapter::count', type, modelName, options);
    }

    process.nextTick(function () {
      callback(new Error('MockStoreAdapter does not support counting.'));
    }.bind(this));
  };

function _testDocFilter(filter, doc) {
  if (filter === undefined) {
    return true;
  }

  var SPECIAL_KEYS = ['$exists', '$contains'];

  if (filter.$exists !== undefined) {
    if (filter.$exists) {
      if (doc === undefined) {
        return false;
      }
    } else {
      if (doc !== undefined) {
        return false;
      }
    }
  }
  if (filter.$contains !== undefined) {
    if (!Array.isArray(doc)) {
      return false;
    }
    var didContain = false;
    for (var k = 0; k < doc.length; ++k) {
      didContain |= _testDocFilter(filter.$contains, doc[k]);
    }
    if (!didContain) {
      return false;
    }
  }

  for (var i in filter) {
    if (filter.hasOwnProperty(i)) {
      if (SPECIAL_KEYS.indexOf(i) !== -1) {
        continue;
      }

      var iSplit = i.split('.');
      var subDoc = doc;
      for (var j = 0; j < iSplit.length; ++j) {
        if (subDoc instanceof Object) {
          subDoc = subDoc[iSplit[j]];
        } else {
          subDoc = undefined;
          break;
        }
      }

      if (filter[i] instanceof Object) {
        if (doc instanceof Object) {
          if (!_testDocFilter(filter[i], subDoc)) {
            return false;
          }
        } else {
          if (!_testDocFilter(filter[i], undefined)) {
            return false;
          }
        }
      } else {
        if (filter[i] !== subDoc) {
          return false;
        }
      }
    }
  }
  return true;
}

MockStoreAdapter.prototype.find =
  function (type, model, options, callback) {
    var modelName = model.schema.name;

    if (this.debug) {
      console.log('MockStoreAdapter::find', type, modelName, options);
    }

    process.nextTick(function () {
      var results = [];

      var filter = this._normalizeFilter(options.filter);

      if (this.debug) {
        console.log('MockStoreAdapter::find~filter', filter);
      }

      for (var i in this.data) {
        if (this.data.hasOwnProperty(i)) {
          var keyValue = this.data[i].value;

          if (keyValue._type !== modelName) {
            continue;
          }

          if (!_testDocFilter(filter, keyValue)) {
            continue;
          }

          var keyInfo = this.serializer.decodeModelKey(i);
          results.push(model.ref(keyInfo.id));
        }
      }

      callback(null, results);
    }.bind(this));
  };

module.exports = MockStoreAdapter;
