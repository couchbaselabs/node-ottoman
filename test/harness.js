var couchbase = require('couchbase');
var ottoman = require('../lib/ottoman.js');

var uniqueIdCounter = 0;
function uniqueId(prefix) {
  return prefix + (uniqueIdCounter++);
}
module.exports.uniqueId = uniqueId;

var cluster = new couchbase.Mock.Cluster();
var bucket = cluster.openBucket();
module.exports.bucket = bucket;

ottoman.bucket = new ottoman.CbStoreAdapter(bucket);
module.exports.lib = ottoman;

module.exports.cbErrors = couchbase.errors;
