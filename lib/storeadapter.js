var util = require('util');
var couchbase = require('couchbase');

function StoreAdapter() {
}

function CbStoreAdapter(bucket) {
  this.bucket = bucket;
  this.ddocs = {};
}
util.inherits(CbStoreAdapter, StoreAdapter);
StoreAdapter.Couchbase = CbStoreAdapter;

CbStoreAdapter.prototype.isNotFoundError = function(err) {
  return err.code === couchbase.errors.keyNotFound;
};

//callback(err, value, cas)
CbStoreAdapter.prototype.get = function(key, callback) {
  this.bucket.get(key, function(err, res) {
    if (err) {
      callback(err, null, null);
      return;
    }

    callback(null, res.value, res.cas);
  });
};

//callback(err, cas)
CbStoreAdapter.prototype.store = function(key, data, cas, callback) {
  var saveHandler = function(err, res) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, res.cas);
  };
  if (cas) {
    this.bucket.replace(key, data, cas, saveHandler);
  } else {
    this.bucket.insert(key, data, saveHandler);
  }
};

//callback(err)
CbStoreAdapter.prototype.remove = function(key, cas, callback) {
  if (cas) {
    this.bucket.remove(key, {cas:cas}, callback);
  } else {
    this.bucket.remove(key, callback);
  }
};

function _buildViewMapFn(schemaName, fields) {
  var out = '';
  out += 'function(doc, meta) {\n';
  out += '  if(doc._type === \'' + schemaName + '\') {\n';

  var fieldArr = [];
  for (var i = 0; i < fields.length; ++i) {
    fieldArr.push('doc.' + fields[i]);
  }
  out += '    emit([' + fieldArr.join(',') + '], null);\n';

  out += '  }\n';
  out += '}';
  return out;
}

//callback(err)
CbStoreAdapter.prototype.createIndex = function(type, modelName, name, fields, callback) {
  if (type !== 'view') {
    throw new Error('Couchbase does not support the index type specified `' + type + '`.')
  }

  var mapFnStr = _buildViewMapFn(modelName, fields);

  if (!this.ddocs[modelName]) {
    this.ddocs[modelName] = {views:{}}
  }

  this.ddocs[modelName].views[name] = {
    map: mapFnStr
  };

  process.nextTick(function() {
    callback(null);
  });
};

//callback(err)
CbStoreAdapter.prototype.ensureIndices = function(callback) {
  var ddocs = [];
  for (var i in this.ddocs) {
    if (this.ddocs.hasOwnProperty(i)) {
      ddocs.push({
        name: i,
        data: this.ddocs[i]
      });
    }
  }

  if (ddocs.length === 0) {
    callback(null);
    return;
  }

  var bucketMgr = this.bucket.manager();

  var proced = 0;
  for (var i = 0; i < ddocs.length; ++i) {
    var ddoc = ddocs[i];

    bucketMgr.upsertDesignDocument(ddoc.name, ddoc.data, function(err) {
      if (err) {
        proced = ddocs.length;
        callback(err);
        return;
      }

      proced++;
      if (proced === ddocs.length) {
        callback(null);
        return;
      }
    });
  }
};

//options:
//  key
//  range : [start, end]
//callback(err, results)
CbStoreAdapter.prototype.searchIndex = function(type, modelName, name, options, callback) {
  if (type !== 'view') {
    throw new Error('Couchbase does not support the index type specified `' + type + '`.')
  }
  if (options.key && options.range) {
    throw new Error('Cannot query by name and range at the same time!');
  }

  var query = couchbase.ViewQuery.from(modelName, name);
  if (options.key) {
    query.key(options.key);
  }
  this.bucket.query(query, function(err, res) {
    callback(err, res);
  });
};

module.exports = StoreAdapter;
