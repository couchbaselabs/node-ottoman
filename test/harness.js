var couchbase = require('couchbase');

var uniqueIdCounter = 0;
function uniqueId(prefix) {
  return prefix + (uniqueIdCounter++);
}
module.exports.uniqueId = uniqueId;

var cluster = new couchbase.Mock.Cluster();
module.exports.bucket = cluster.openBucket();

module.exports.cbErrors = couchbase.errors;
