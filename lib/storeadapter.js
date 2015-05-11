var util = require('util');
var couchbase = require('couchbase');

function StoreAdapter() {
}

function CbStoreAdapter(bucket) {
  StoreAdapter.call(this);

  this.bucket = bucket;
  this.ddocs = {};
  this.debug = false;
}
util.inherits(CbStoreAdapter, StoreAdapter);
StoreAdapter.Couchbase = CbStoreAdapter;

CbStoreAdapter.prototype.isNotFoundError = function(err) {
  return err.code === couchbase.errors.keyNotFound;
};

//callback(err, value, cas)
CbStoreAdapter.prototype.get = function(key, callback) {
  if (this.debug) {
    console.log('CbStoreAdapter::get', key);
  }

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
  if (this.debug) {
    console.log('CbStoreAdapter::store', key, cas, data);
  }

  var saveHandler = function(err, res) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, res.cas);
  };
  if (cas) {
    this.bucket.replace(key, data, {cas: cas}, saveHandler);
  } else {
    this.bucket.insert(key, data, {}, saveHandler);
  }
};

//callback(err)
CbStoreAdapter.prototype.remove = function(key, cas, callback) {
  if (this.debug) {
    console.log('CbStoreAdapter::remove', key, cas);
  }

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
  if (this.debug) {
    console.log('CbStoreAdapter::createIndex', type, modelName, name, fields);
  }

  if (type !== 'view') {
    callback(new Error('Couchbase does not support the index type specified `' + type + '`.'));
    return;
  }

  var mapFnStr = _buildViewMapFn(modelName, fields);

  if (this.debug) {
    console.log('Map Function:', mapFnStr);
  }

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
  if (this.debug) {
    console.log('CbStoreAdapter::ensureIndices');
  }

  var ddocs = [];
  for (var i in this.ddocs) {
    if (this.ddocs.hasOwnProperty(i)) {
      ddocs.push({
        name: i,
        data: this.ddocs[i]
      });
    }
  }

  ddocs.push({
    name: 'otto',
    data: {
      views: {
        count_items: {
          map: 'function(doc,meta){emit(doc._type,null);}',
          reduce: '_count'
        }
      }
    }
  });

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
  if (this.debug) {
    console.log('CbStoreAdapter::searchIndex', type, modelName, name, options);
  }

  if (type !== 'view') {
    callback(new Error('Couchbase does not support the index type specified `' + type + '`.'), null);
    return;
  }
  if (options.key && options.range) {
    callback(new Error('Cannot query by name and range at the same time!'), null);
    return;
  }

  var query = couchbase.ViewQuery.from(modelName, name);
  if (options.key) {
    query.key(options.key);
  }
  if (options.limit) {
    query.limit(options.limit);
  }
  this.bucket.query(query, function(err, res) {
    callback(err, res);
  });
};

function buildFilterExprs(filters, expressions, root) {
  if (!root) {
    root = '';
  }

  for (var i in filters) {
    if (filters.hasOwnProperty(i)) {
      if (i[0] === '$') {
        continue;
      }
      if (filters[i].$exists) {
        expressions.push(root + i + ' IS VALUED');
      }
      if (filters[i] instanceof Object) {
        buildFilterExprs(filters[i], expressions, root + i + '.');
      } else {
        if (typeof filters[i] === 'number') {
          expressions.push(root + i + '=' + filters[i]);
        } else if (typeof filters[i] === 'string') {
          expressions.push(root + i + '=\'' + filters[i].replace('\'', '\\\'') + '\'');
        } else {
          throw new Error('Invalid filter value.');
        }
      }
    }
  }
}

//options:
//  filter
//callback(err, results)
CbStoreAdapter.prototype.count = function(type, modelName, options, callback) {
  if (this.debug) {
    console.log('CbStoreAdapter::count', type, modelName, options);
  }

  var expressions = [];
  expressions.push('_type=\'' + modelName + '\'');
  if (options.filter) {
    buildFilterExprs(options.filter, expressions);
  }
  var bucketName = this.bucket._name;
  var whereQs = '';
  if (expressions.length > 0) {
    whereQs = ' WHERE ' + expressions.join(' AND ');
  }

  var fullQs = 'SELECT COUNT(v) AS count FROM `' + bucketName + '` v' + whereQs;
  if (this.debug) {
    console.log('CbStoreAdapter::count~query', fullQs);
  }

  var query = couchbase.N1qlQuery.fromString(fullQs);
  this.bucket.query(query, function(err, res) {
    console.log(err, res);

    if (err) {
      callback(err, null);
      return;
    }

    callback(err, res[0]['count']);
  });
};

//options:
//  filter
//  limit
//  skip
//  sort
//callback(err, results)
CbStoreAdapter.prototype.find = function(type, modelName, options, callback) {
  if (this.debug) {
    console.log('CbStoreAdapter::find', type, modelName, options);
  }

  var expressions = [];
  expressions.push('_type=\'' + modelName + '\'');
  if (options.filter) {
    buildFilterExprs(options.filter, expressions);
  }
  var bucketName = this.bucket._name;
  var whereQs = '';
  if (expressions.length > 0) {
    whereQs = ' WHERE ' + expressions.join(' AND ');
  }
  var pagingQs = '';
  if (options.limit !== undefined && options.skip !== undefined) {
    pagingQs = ' LIMIT ' + options.limit + ' OFFSET ' + options.skip;
  } else if (options.limit !== undefined) {
    pagingQs = ' LIMIT ' + options.limit;
  } else if (options.skip !== undefined) {
    throw new Error('Must have limit to use skip.');
  }
  var sortQs = '';
  if (options.sort !== undefined) {
    var sortKeys = options.sort;
    if (typeof sortKeys === 'string') {
      sortKeys = [sortKeys];
    }

    if (Array.isArray(sortKeys)) {
      sortQs = ' ORDER BY ' + sortKeys.join(',');
    } else if (sortKeys instanceof Object) {
      var sortWords = [];
      for (var i in sortKeys) {
        if (sortKeys.hasOwnProperty(i)) {
          if (sortKeys[i] === 1 || sortKeys[i] === true) {
            sortWords.push(i + ' ASC');
          } else {
            sortWords.push(i + ' DESC');
          }
        }
      }
      sortQs = ' ORDER BY ' + sortWords.join(',');
    } else {
      throw new Error('Unknown sort value.');
    }
  }

  var fullQs = 'SELECT META(v).id AS id FROM `' + bucketName + '` v' + whereQs + sortQs + pagingQs;
  if (this.debug) {
    console.log('CbStoreAdapter::find~query', fullQs);
  }

  var query = couchbase.N1qlQuery.fromString(fullQs);
  this.bucket.query(query, function(err, res) {
    callback(err, res);
  });
};

//callback(err, number)
CbStoreAdapter.prototype.countModels = function(modelName, callback) {
  var query = couchbase.ViewQuery.from('otto', 'count_items');
  query.group_level(1);
  query.key(modelName);
  this.bucket.query(query, function(err, res) {
    if (err) {
      callback(err);
      return;
    }

    if (res.length === 0) {
      callback(null, 0);
      return;
    }

    callback(null, res[0].value);
  });
};

module.exports = StoreAdapter;
