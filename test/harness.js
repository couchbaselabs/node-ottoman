const ottoman = require('../lib/ottoman.js');

// Open a connection
if (process.env.CNCSTR) {
  const couchbase = require('couchbase');

  const cluster = new couchbase.Cluster(process.env.CNCSTR);
  const bucket = cluster.openBucket();

  let seenKeys = [];
  const _bucketInsert = bucket.insert.bind(bucket);
  bucket.insert = function(key, value, options, callback) {
    seenKeys.push(key);
    return _bucketInsert(key, value, options, callback);
  };
  const _bucketUpsert = bucket.upsert.bind(bucket);
  bucket.upsert = function(key, value, options, callback) {
    seenKeys.push(key);
    return _bucketUpsert(key, value, options, callback);
  };
  const _bucketReplace = bucket.replace.bind(bucket);
  bucket.replace = function(key, value, options, callback) {
    seenKeys.push(key);
    return _bucketReplace(key, value, options, callback);
  };
  after(function(done) {
    if (seenKeys.length === 0) {
      return done();
    }

    let remain = seenKeys.length;
    for (let i = 0; i < seenKeys.length; ++i) {
      bucket.remove(seenKeys[i], function() {
        remain--;
        if (remain === 0) {
          seenKeys = [];
          done();
        }
      });
    }
  });

  ottoman.bucket = bucket;
} else {
  ottoman.store = new ottoman.MockStoreAdapter();
}

// Setup Ottoman
module.exports.lib = ottoman;

// Some helpers
function _saveAllModels(modelArr, callback) {
  let i = 0;
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
    });
  })();
}
module.exports.saveAll = _saveAllModels;

let uniqueIdCounter = 0;
function uniqueId(prefix) {
  return prefix + uniqueIdCounter++;
}
module.exports.uniqueId = uniqueId;
