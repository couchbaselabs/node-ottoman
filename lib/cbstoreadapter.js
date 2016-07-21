'use strict';

var util = require('util');
var ottopath = require('./ottopath');
var StoreAdapter = require('./storeadapter');
var Promise = require('bluebird');

var builtinCouchbase = null;
try {
  builtinCouchbase = require('couchbase');
} catch (e) {
  return;
}

/**
 * The Couchbase store adapter implements an Ottoman StoreAdapter suitable
 *   for using Ottoman with Couchbase Server.
 * @param bucket
 * @constructor
 */
function CbStoreAdapter(bucket, cb) {
  StoreAdapter.call(this);

  if (!cb) {
    // If the couchbase instance was not explicitly passed, we need to
    //  ensure that the user passed us a bucket which is compatible with
    //  the couchbase module we have locally.
    if (!builtinCouchbase) {
      throw new Error('You must explicitly specify a couchbase module as' +
        ' ottoman was installed without a couchbase dependancy.');
    }
    if (!(bucket instanceof builtinCouchbase.BucketImpl)) {
      throw new Error('The couchbase module version used by the application'
        + ' does not match Ottomans.  Please explicitly pass the application'
        + ' couchbase module using `StoreAdapter.Couchbase`.');
    }

    cb = builtinCouchbase;
  }

  this.couchbase = cb;
  this.bucket = bucket;
  this.ddocs = {};
  this.gsis = {};
  this.debug = false;
}
util.inherits(CbStoreAdapter, StoreAdapter);

/**
 * Returns whether a particular error is a document not-found error.
 *
 * @param err
 * @returns {boolean}
 */
CbStoreAdapter.prototype.isNotFoundError = function (err) {
  return err.code === this.couchbase.errors.keyNotFound;
};

/**
 * Retrieves a stored document by it's key.
 *
 * @param {string} key
 *   The key of the document to retrieve.
 * @param {StoreAdapter~GetCallback} callback
 */
CbStoreAdapter.prototype.get = function (key, callback) {
  if (this.debug) {
    console.log('CbStoreAdapter::get', key);
  }

  this.bucket.get(key, function (err, res) {
    if (err) {
      callback(err, null, null);
      return;
    }

    callback(null, res.value, res.cas);
  });
};

/**
 * Stores a document using it's key for later retrieval.
 *
 * @param {string} key
 *   The key of the document to store.
 * @param {Object} data
 *   The data to store for the document.
 * @param {Object} cas
 *   If not-null, an opaque CAS value to verify before the operation succeeds.
 * @param {StoreAdapter~StoreCallback} callback
 */
CbStoreAdapter.prototype.store = function (key, data, cas, callback) {
  if (this.debug) {
    console.log('CbStoreAdapter::store', key, cas, data);
  }

  var saveHandler = function (err, res) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, res.cas);
  };
  if (cas) {
    this.bucket.replace(key, data, { cas: cas }, saveHandler);
  } else {
    this.bucket.insert(key, data, {}, saveHandler);
  }
};

/**
 * Removes a document using it's key.
 *
 * @param key
 *   The key of the document to remove.
 * @param {Object} cas
 *   If not-null, an opaque CAS value to verify before the operation succeeds.
 * @param {StoreAdapter~RemoveCallback} callback
 */
CbStoreAdapter.prototype.remove = function (key, cas, callback) {
  if (this.debug) {
    console.log('CbStoreAdapter::remove', key, cas);
  }

  if (cas) {
    this.bucket.remove(key, { cas: cas }, callback);
  } else {
    this.bucket.remove(key, callback);
  }
};

/**
 * Builds a view map function which will index the specified fields
 *   for any documents with the specified type.
 *
 * @param {string} schemaName
 *   The name of the type that should be indexed.
 * @param {string[]} fields
 *   The list of fields that should be indexed.
 * @returns {string}
 * @private
 * @ignore
 */
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

/**
 * Creates a view index.  This simply generates the view design document
 *   and then saves it locally, waiting for the ensureIndices call to
 *   actually perform the server-side creation.
 *
 * @param {string} modelName
 *   The name of the model this index belongs to.
 * @param {string} name
 *   The name of the index to created.
 * @param {string[]} fields
 *   A list of field names that should be indexed.
 * @param {StoreAdapter~CreateIndexCallback} callback
 * @private
 * @ignore
 */
CbStoreAdapter.prototype._createViewIndex =
  function (modelName, name, fields, callback) {
    var mapFnStr = _buildViewMapFn(modelName, fields);

    if (this.debug) {
      console.log('Map Function:', mapFnStr);
    }

    if (!this.ddocs[modelName]) {
      this.ddocs[modelName] = { views: {} };
    }

    this.ddocs[modelName].views[name] = {
      map: mapFnStr
    };

    process.nextTick(function () {
      callback(null);
    });
  };

/**
 * Creates a N1QL index.  This simply creates a record for the index, waiting
 *   for the ensureIndices call to actually perform the server-side creation.
 *
 * @param {string} modelName
 *   The name of the model this index belongs to.
 * @param {string} name
 *   The name of the index to created.
 * @param {string[]} fields
 *   A list of field names that should be indexed.
 * @param {StoreAdapter~CreateIndexCallback} callback
 * @private
 * @ignore
 */
CbStoreAdapter.prototype._createN1qlIndex =
  function (modelName, name, fields, callback) {
    this.gsis[name] = {
      modelName: modelName,
      fields: fields
    };

    process.nextTick(function () {
      callback(null);
    });
  };

/**
 * Creates an index of the specified type.  This simply records the data for
 *   the specified index, the bulk of the creation work is actually done in
 *   the `ensureIndices` method.
 * @param {string} type
 *   The type of index to create.  This value is passed through from the
 *     type field specified in a schema's index definition.
 * @param {string} modelName
 *   The name of the model this index belongs to.
 * @param {string} name
 *   The name of the index to created.
 * @param {string[]} fields
 *   A list of field names that should be indexed.
 * @param {StoreAdapter~CreateIndexCallback} callback
 */
CbStoreAdapter.prototype.createIndex =
  function (type, modelName, name, fields, callback) {
    if (this.debug) {
      console.log('CbStoreAdapter::createIndex',
        type, modelName, name, fields);
    }

    if (type === 'view') {
      return this._createViewIndex(modelName, name, fields, callback);
    } else if (type === 'n1ql') {
      return this._createN1qlIndex(modelName, name, fields, callback);
    } else {
      callback(new Error(
        'Couchbase does not support the index type specified `' +
        type + '`.'));
      return;
    }
  };

/**
 * Ensures that all Map-Reduce (view) indexes are created and available
 * on the server.
 *
 * @param {StoreAdapter~EnsureCallback} callback
 * @private
 * @ignore
 */
CbStoreAdapter.prototype._ensureMrIndices = function (callback) {
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
  function handler(err) {
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
  }
  for (var j = 0; j < ddocs.length; ++j) {
    var ddoc = ddocs[j];

    bucketMgr.upsertDesignDocument(ddoc.name, ddoc.data, handler);
  }
};

function _ottopathToN1qlPath(path) {
  var fields = [];
  for (var k = 0; k < path.length; ++k) {
    if (path[k].operation === 'member') {
      if (path[k].expression.type !== 'identifier') {
        throw new Error('Unexpected member expression type.');
      }
      fields.push('`' + path[k].expression.value + '`');
    } else if (path[k].operation === 'subscript') {
      if (path[k].expression.type !== 'string_literal') {
        throw new Error('Unexpected subscript expression type.');
      }
      fields.push('`' + path[k].expression.value + '`');
    } else {
      throw new Error('Unexpected path operation type.');
    }
  }
  return fields.join('.');
}

/**
 * Ensures that all GSI (N1QL) indexes are created and available
 * on the server.
 *
 * @param {StoreAdapter~EnsureCallback} callback
 * @private
 * @ignore
 */
CbStoreAdapter.prototype._ensureGsiIndices = function (callback) {
  var queries = [];
  var indexes = [];

  // Build a list of indexes to create.
  // General strategy for this function is to first issue a
  // CREATE PRIMARY INDEX
  // Then do a number of "CREATE INDEX" statements, deferring build.
  // Finally, do a "BUILD INDEX" statement to catch up on all of the
  // deferreds.
  for (var i in this.gsis) {
    if (this.gsis.hasOwnProperty(i)) {
      var gsi = this.gsis[i];

      var indexName =
         i.replace('$', '__')
          .replace('[*]', '-ALL')
          .replace('::', '-');
      var fieldNames = [];
      for (var j = 0; j < gsi.fields.length; ++j) {
        try {
          var path = ottopath.parse(gsi.fields[j]);
          var wildCardAt = -1;
          for (var k = 0; k < path.length; ++k) {
            if (path[k].operation === 'subscript' &&
              path[k].expression.type === 'wildcard') {
              if (wildCardAt !== -1) {
                throw new Error('Cannot create an index' +
                  ' with more than ' +
                  'one wildcard in path.');
              }
              wildCardAt = k;
            }
          }

          if (wildCardAt === -1) {
            fieldNames.push(_ottopathToN1qlPath(path));
          } else {
            var pathBefore = path.slice(0, wildCardAt);
            var pathAfter = path.slice(wildCardAt + 1);

            var objTarget = _ottopathToN1qlPath(pathAfter);
            if (objTarget !== '') {
              objTarget = 'v.' + objTarget;
            } else {
              objTarget = 'v';
            }

            var arrTarget = _ottopathToN1qlPath(pathBefore);

            fieldNames.push('DISTINCT ARRAY ' + objTarget +
              ' FOR v IN ' + arrTarget + ' END');
          }
        } catch (e) {
          callback(e);
          return;
        }
      }

      queries.push(
        'CREATE INDEX `' + indexName + '` ' +
        'ON `' + this.bucket._name + '`(' +
        fieldNames.join(',') +
        ') ' +
        'WHERE _type="' + gsi.modelName + '" ' +
        'USING GSI WITH {\"defer_build\": true}');

      // Keep track of all indexes we are creating, so we can
      // build them later.
      indexes.push(indexName);
    }
  }

  // Set reference so inner callbacks can use this.
  var self = this;

  // Simple way of turning n1ql query into a chainable promise.
  // TODO when couchbase is later more promisified, this shouldn't be here,
  // but would be preferable as a bucket.query() convenience method.
  var queryPromise = function (stringQuery) {
    return new Promise(function (resolve, reject) {
      var n1ql = self.couchbase.N1qlQuery.fromString(stringQuery);

      return self.bucket.query(n1ql, function (err, rows, meta) {
        var str = (err ? err.toString() : '');
        // Ignore "already exists" and "already built" errors that
        // may arise in cb 4.5 if we have previously tried to create them.
        if (err &&
          !str.match(/index.*already exists/i) &&
          !str.match(/index.*is being built/i) &&
          !str.match(/index.*already built/i)) {
          return reject(err);
        }

        return resolve({ rows: rows, meta: meta });
      });
    });
  };

  // This promise chain creates all indexes in proper order.
  // Create primary index; without this, nothing works.
  queryPromise('CREATE PRIMARY INDEX ON `' + this.bucket._name + '` USING GSI')
    .then(function () {
      indexes.push('Ottoman__type');
      // Create ottoman type index, needed to make model lookups fast.
      return queryPromise('CREATE INDEX `Ottoman__type` ON ' +
        self.bucket._name + '(`_type`) USING GSI WITH {"defer_build": true}');
    })
    .then(function () {
      // Map createIndex across all individual n1ql model indexes.
      // concurrency: 1 is important to avoid overwhelming server.
      // Promise.all turns the array into a single promise again.
      return Promise.all(Promise.map(queries, function (query) {
        return queryPromise(query);
      }, { concurrency: 1 }));
    })
    .then(function () {
      // All indexes were built deferred, so now kick off actual build.
      var buildEm = 'BUILD INDEX ON `' + self.bucket._name + '`(' +
        indexes.map(function (idx) {
          return '`' + idx + '`';
        }).join(',') +
        ') USING GSI';
      return queryPromise(buildEm);
    })
    // If you've gotten this far, everything's good.
    .then(function () { return callback(null); })
    .catch(function (err) { return callback(err); });

  return null;
};

/**
 * Ensures that all indexes specified by createIndex calls are created and
 *   available on the server.
 *
 * @param {StoreAdapter~EnsureCallback} callback
 */
CbStoreAdapter.prototype.ensureIndices = function (callback) {
  if (this.debug) {
    console.log('CbStoreAdapter::ensureIndices');
  }

  var self = this;

  self._ensureMrIndices(function (err) {
    if (err) {
      callback(err);
      return;
    }

    self._ensureGsiIndices(function (err) {
      if (err) {
        callback(err);
        return;
      }

      callback(null);
    });
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
CbStoreAdapter.prototype._searchViewIndex =
  function (type, modelName, name, options, callback) {
    if (options.key && options.range) {
      callback(new Error(
        'Cannot query by name and range at the same time!'), null);
      return;
    }

    var query = this.couchbase.ViewQuery.from(modelName, name);
    if (options.key) {
      query.key(options.key);
    }
    if (options.limit) {
      query.limit(options.limit);
    }
    if (options.consistency) {
      if (options.consistency ===
        StoreAdapter.SearchConsistency.GLOBAL) {
        query.stale(this.couchbase.ViewQuery.Update.BEFORE);
      } else if (options.consistency ===
        StoreAdapter.SearchConsistency.LOCAL) {
        query.stale(this.couchbase.ViewQuery.Update.BEFORE);
      } else if (options.consistency ===
        StoreAdapter.SearchConsistency.NONE) {
        query.stale(this.couchbase.ViewQuery.Update.NONE);
      } else {
        callback(new Error('Unexpected consistency option.'), null);
        return;
      }
    }
    this.bucket.query(query, function (err, res) {
      callback(err, res);
    });
  };

/**
 * Performs a search against a N1QL index.
 *
 * @param {string} type
 * @param {string} modelName
 * @param {string} name
 * @param {Object} options
 * @param {StoreAdapter~SearchCallback} callback
 * @private
 * @ignore
 */
CbStoreAdapter.prototype._searchN1qlIndex =
  function (type, modelName, name, options, callback) {
    var index = this.gsis[name];
    if (!index) {
      callback(new Error('Could not find gsi index configuration.'), null);
      return;
    }

    if (options.range) {
      callback(new Error(
        'Cannot query by range using N1QL indices!'), null);
      return;
    }

    var filter = {};
    if (options.key) {
      for (var i = 0; i < index.fields.length; ++i) {
        var field = index.fields[i];
        filter[field] = options.key[i];
      }
    }

    this.find(type, modelName, {
      filter: filter,
      limit: options.limit,
      consistency: options.consistency
    }, callback);
  };

/**
 * Performs a search against an index.
 *
 * @param {string} type
 *   The type of index that we are searching.
 * @param {string} modelName
 *   The model that this index is related to.
 * @param {string} name
 *   The name of the index to search
 * @param {Object} options
 *  @param {string} key
 *    The specific key we want to locate in the index.
 *  @param {Object} range
 *    @param {string} start
 *      The starting key of a key-range to search.
 *    @param {string} end
 *      The ending key of a key-range to search.
 * @param {StoreAdapter~SearchCallback} callback
 */
CbStoreAdapter.prototype.searchIndex =
  function (type, modelName, name, options, callback) {
    if (this.debug) {
      console.log('CbStoreAdapter::searchIndex',
        type, modelName, name, options);
    }

    if (type === 'view') {
      return this._searchViewIndex(type, modelName, name, options, callback);
    } else if (type === 'n1ql') {
      return this._searchN1qlIndex(type, modelName, name, options, callback);
    } else {
      callback(new Error(
        'Couchbase does not support the index type specified `' +
        type + '`.'));
      return;
    }
  };

/**
 * Builds a N1QL expression that will filter based on the
 *   specified Ottoman filter expression.
 *
 * @param {Object} filters
 *   The Ottoman filter expression object that we are currently parsing.
 * @param {string[]} expressions
 *   A list of expresion that have been generated so far.
 * @param {string} [root]
 *   The root path leading up to the keys specified in the filter.
 * @private
 * @ignore
 */
function _buildFilterExprs(filters, expressions, root) {
  var SPECIAL_KEYS = ['$exists', '$contains'];
  var BOOLEAN = ['or', 'and'];
  if (!root) {
    root = '';
  }

  for (var i in filters) {
    if (filters.hasOwnProperty(i)) {
      if (SPECIAL_KEYS.indexOf(i) !== -1) {
        continue;
      }

      var ident = root + '`' + i.split('.').join('`.`') + '`';
      if (filters[i].$exists) {
        expressions.push(ident + ' IS VALUED');
      }
      if (filters[i].$contains) {
        var subfilters = filters[i].$contains;
        var subexprs = [];
        _buildFilterExprs(subfilters, subexprs, 'x.');
        expressions.push('ANY x IN ' + ident + ' SATISFIES ' +
          subexprs.join(' AND ') + ' END');
      }
      if (BOOLEAN.indexOf(i.toLowerCase()) !== -1) {
        var booleanExprs = [];

        for (var j in filters[i]) {
          if (filters[i].hasOwnProperty(j)) {
            _buildFilterExprs(filters[i][j], booleanExprs, '');
          }
        }

        expressions.push('(' + booleanExprs.join(' ' +
          i.toUpperCase() + ' ') + ')');
      } else if (i.toLowerCase() === 'not') {
        var notExprs = [];
        for (var z in filters[i]) {
          if (filters[i].hasOwnProperty(z)) {
            _buildFilterExprs(filters[i][z], notExprs, '');
          }
        }
        expressions.push('NOT (' + notExprs.join(' AND ') + ')');
      } else if (filters[i] instanceof Object) {
        _buildFilterExprs(filters[i], expressions, ident + '.');
      } else {
        if (typeof filters[i] === 'number' || typeof filters[i] === 'boolean') {
          expressions.push(ident + '=' + filters[i]);
        } else if (typeof filters[i] === 'string') {
          expressions.push(
            ident + '=\'' + filters[i].replace('\'', '\\\'') + '\'');
        } else {
          throw new Error('Invalid filter value.');
        }
      }
    }
  }
}

/**
 * Performs a count of the documents matching a particular
 *   filter expression and model type.
 *
 * @param {string} type
 *   The type of index to use for the search.  Currently unused (always N1QL).
 * @param {string} modelName
 *   The name of the model to look for.
 * @param {Object} options
 *   @param {Object} options.filter
 *     The filter expression for filtering documents for counting.
 * @param {StoreAdapter~SearchCallback} callback
 */
CbStoreAdapter.prototype.count = function (type, modelName, options, callback) {
  if (this.debug) {
    console.log('CbStoreAdapter::count', type, modelName, options);
  }

  var expressions = [];
  expressions.push('_type=\'' + modelName + '\'');
  if (options.filter) {
    _buildFilterExprs(options.filter, expressions);
  }
  var bucketName = this.bucket._name;
  var whereQs = '';
  if (expressions.length > 0) {
    whereQs = ' WHERE ' + expressions.join(' AND ');
  }

  var fullQs = 'SELECT COUNT(b) AS count FROM `' + bucketName + '` b' + whereQs;
  if (this.debug) {
    console.log('CbStoreAdapter::count~query', fullQs);
  }

  var query = this.couchbase.N1qlQuery.fromString(fullQs);
  this.bucket.query(query, function (err, res) {
    if (err) {
      callback(err, null);
      return;
    }

    if (res.length > 0) {
      callback(null, res[0].count);
    } else {
      callback(null, 0);
    }
  });
};

/**
 * Performs a generic find by a filter expression.
 *
 * @param {string} type
 *   The type of index to use for the search.  Currently unused (always N1QL).
 * @param {string} modelName
 *   The name of the model to search within.
 * @param {Object} options
 *   @param {Object} options.filter
 *     The filter expression to filter with.
 *   @param {number} options.limit
 *     The maximum number of results to return.
 *   @param {number} options.skip
 *     The number of results to skip before returning results.
 *   @param {string|string[]} options.sort
 *     A field name or list of field names to sort the results by.
 * @param {StoreAdapter~SearchCallback} callback
 */
CbStoreAdapter.prototype.find = function (type, modelName, options, callback) {
  if (this.debug) {
    console.log('CbStoreAdapter::find', type, modelName, options);
  }

  var expressions = [];
  expressions.push('_type=\'' + modelName + '\'');
  if (options.filter) {
    _buildFilterExprs(options.filter, expressions);
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

  var fullQs =
    'SELECT META(b).id AS id FROM `' + bucketName +
    '` b' + whereQs + sortQs + pagingQs;
  if (this.debug) {
    console.log('CbStoreAdapter::find~query', fullQs);
  }

  var query = this.couchbase.N1qlQuery.fromString(fullQs);

  if (options.consistency) {
    if (options.consistency === StoreAdapter.SearchConsistency.GLOBAL) {
      query.consistency(this.couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
    } else if (options.consistency === StoreAdapter.SearchConsistency.LOCAL) {
      query.consistency(this.couchbase.N1qlQuery.Consistency.REQUEST_PLUS);
    } else if (options.consistency === StoreAdapter.SearchConsistency.NONE) {
      query.consistency(this.couchbase.N1qlQuery.Consistency.NOT_BOUNDED);
    } else {
      callback(new Error('Unexpected consistency option.'), null);
      return;
    }
  }

  this.bucket.query(query, function (err, res) {
    callback(err, res);
  });
};

module.exports = CbStoreAdapter;
