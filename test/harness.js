var couchbase = require('couchbase');
var ottoman = require('../lib/ottoman.js');

// Open the Couchbase Connection
var cluster = null;
if (process.env.CNCSTR !== undefined) {
  cluster = new couchbase.Cluster(process.env.CNCSTR);
} else {
  cluster = new couchbase.Mock.Cluster();
}

bucket = cluster.openBucket();
module.exports.bucket = bucket;

// Hijack storage operations on the bucket to track keys
var seenKeys = [];
var _bucketInsert = bucket.insert.bind(bucket);
bucket.insert = function(key, value, options, callback) {
  seenKeys.push(key);
  return _bucketInsert(key, value, options, callback);
};
var _bucketUpsert = bucket.upsert.bind(bucket);
bucket.upsert = function(key, value, options, callback) {
  seenKeys.push(key);
  return _bucketUpsert(key, value, options, callback);
};
var _bucketReplace = bucket.replace.bind(bucket);
bucket.replace = function(key, value, options, callback) {
  seenKeys.push(key);
  return _bucketReplace(key, value, options, callback);
};
after(function(done) {
  if (seenKeys.length === 0) {
    return done();
  }

  var remain = seenKeys.length;
  for (var i = 0; i < seenKeys.length; ++i) {
    bucket.remove(seenKeys[i], function () {
      remain--;
      if (remain === 0) {
        seenKeys = [];
        done();
      }
    });
  }
});

// Setup Ottoman
ottoman.bucket = bucket;
module.exports.lib = ottoman;

// Some helpers
function _saveAllModels(modelArr, callback) {
  var i = 0;
  (function __doOne() {
    if (i >= modelArr.length) {
      callback(null);
      return;
    }

    modelArr[i].save(function(err) {
      if (err) {
        callback(err);
        return;
      }

      i++;
      __doOne();
    })
  })();
}
module.exports.saveAll = _saveAllModels;

var uniqueIdCounter = 0;
function uniqueId(prefix) {
  return prefix + (uniqueIdCounter++);
}
module.exports.uniqueId = uniqueId;

module.exports.cbErrors = couchbase.errors;
