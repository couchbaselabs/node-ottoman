const util = require('util');
const StoreAdapter = require('./storeadapter');

const NOT_FOUND_ERR = new Error('Key was not found.');
const ALREADY_EXISTS_ERR = new Error('Key already exists.');
const CAS_MISMATCH_ERR = new Error('CAS does not match.');

function makeCas() {
  return Math.floor(Math.random() * 10000000);
}

function MockStoreAdapter() {
  StoreAdapter.call(this);

  this.data = {};
  this.indexes = {};
  this.debug = false;
}
util.inherits(MockStoreAdapter, StoreAdapter);

MockStoreAdapter.prototype.clear = function() {
  this.data = {};
};

MockStoreAdapter.prototype.isNotFoundError = function(err) {
  return err === NOT_FOUND_ERR;
};

MockStoreAdapter.prototype.get = function(key, callback) {
  if (this.debug) {
    console.log('MockStoreAdapter::get', key);
  }

  process.nextTick(
    function() {
      const keyData = this.data[key];
      if (keyData) {
        callback(null, keyData.value, keyData.cas);
        return;
      }

      callback(NOT_FOUND_ERR, null, null);
    }.bind(this)
  );
};

MockStoreAdapter.prototype.store = function(key, data, cas, callback) {
  if (this.debug) {
    console.log('MockStoreAdapter::store', key, cas, data);
  }

  process.nextTick(
    function() {
      const keyData = this.data[key];
      if (cas) {
        if (keyData.cas !== cas) {
          callback(CAS_MISMATCH_ERR, null);
          return;
        }
      } else if (keyData !== undefined) {
        callback(ALREADY_EXISTS_ERR, null);
        return;
      }

      const newData = {
        cas: makeCas(),
        value: data
      };
      this.data[key] = newData;
      callback(null, newData.cas);
    }.bind(this)
  );
};

MockStoreAdapter.prototype.remove = function(key, cas, callback) {
  if (this.debug) {
    console.log('MockStoreAdapter::remove', key, cas);
  }

  process.nextTick(
    function() {
      const keyData = this.data[key];
      if (cas) {
        if (keyData.cas !== cas) {
          callback(CAS_MISMATCH_ERR);
          return;
        }
      }

      delete this.data[key];
      callback();
    }.bind(this)
  );
};

function _getIndexName(type, modelName, name) {
  return `${type}|${modelName}|${name}`;
}

MockStoreAdapter.prototype.createIndex = function(
  type,
  modelName,
  name,
  fields,
  callback
) {
  const VALID_INDEX_TYPES = ['n1ql', 'view'];

  if (this.debug) {
    console.log('MockStoreAdapter::createIndex', type, modelName, name, fields);
  }

  process.nextTick(
    function() {
      if (VALID_INDEX_TYPES.indexOf(type) === -1) {
        callback(new Error('Invalid index type specified.'));
        return;
      }

      const indexKey = _getIndexName(type, modelName, name);
      this.indexes[indexKey] = fields;
      callback();
    }.bind(this)
  );
};

MockStoreAdapter.prototype.ensureIndices = function(callback) {
  if (this.debug) {
    console.log('MockStoreAdapter::ensureIndices');
  }

  process.nextTick(function() {
    callback();
  });
};

MockStoreAdapter.prototype.searchIndex = function(
  type,
  modelName,
  name,
  options,
  callback
) {
  if (this.debug) {
    console.log(
      'MockStoreAdapter::searchIndex',
      type,
      modelName,
      name,
      options
    );
  }

  process.nextTick(
    function() {
      const indexKey = _getIndexName(type, modelName, name);
      const indexInfo = this.indexes[indexKey];
      if (!indexInfo) {
        callback(new Error('Specified an invalid index to search.'));
        return;
      }

      if (options.key) {
        const filter = {};
        for (let i = 0; i < options.key.length; ++i) {
          filter[indexInfo[i]] = options.key[i];
        }
        delete options.key;
        options.filter = filter;
      }

      this.find(type, modelName, options, callback);
    }.bind(this)
  );
};

MockStoreAdapter.prototype.count = function(
  type,
  modelName,
  options,
  callback
) {
  if (this.debug) {
    console.log('MockStoreAdapter::count', type, modelName, options);
  }

  process.nextTick(function() {
    callback(new Error('MockStoreAdapter does not support counting.'));
  });
};

function _testDocFilter(filter, doc) {
  if (filter === undefined) {
    return true;
  }

  const SPECIAL_KEYS = ['$exists', '$contains'];

  if (filter.$exists !== undefined) {
    if (filter.$exists) {
      if (doc === undefined) {
        return false;
      }
    } else if (doc !== undefined) {
      return false;
    }
  }
  if (filter.$contains !== undefined) {
    if (!Array.isArray(doc)) {
      return false;
    }
    let didContain = false;
    for (let k = 0; k < doc.length; ++k) {
      didContain |= _testDocFilter(filter.$contains, doc[k]);
    }
    if (!didContain) {
      return false;
    }
  }

  for (const i in filter) {
    if (filter.hasOwnProperty(i)) {
      if (SPECIAL_KEYS.indexOf(i) !== -1) {
        continue;
      }

      const iSplit = i.split('.');
      let subDoc = doc;
      for (let j = 0; j < iSplit.length; ++j) {
        if (subDoc instanceof Object) {
          subDoc = subDoc[iSplit[j]];
        } else {
          subDoc = undefined;
          break;
        }
      }

      if (filter[i] instanceof Object) {
        if (doc instanceof Object) {
          _testDocFilter(filter[i], subDoc);
        } else {
          _testDocFilter(filter[i], undefined);
        }
      } else if (filter[i] !== subDoc) {
        return false;
      }
    }
  }
  return true;
}

MockStoreAdapter.prototype.find = function(type, modelName, options, callback) {
  if (this.debug) {
    console.log('MockStoreAdapter::find', type, modelName, options);
  }

  process.nextTick(
    function() {
      const results = [];
      for (const i in this.data) {
        if (this.data.hasOwnProperty(i)) {
          const keyValue = this.data[i].value;
          if (keyValue._type !== modelName) {
            continue;
          }
          if (!_testDocFilter(options.filter, keyValue)) {
            continue;
          }

          results.push({ id: i });
        }
      }

      callback(null, results);
    }.bind(this)
  );
};

module.exports = MockStoreAdapter;
