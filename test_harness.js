var couchbase = require('couchbase').Mock;
var cluster = new couchbase.Cluster();

var uniqueIdCounter = 0;
function uniqueId(prefix) {
  return prefix + (uniqueIdCounter++);
}

module.exports.uniqueId = uniqueId;
module.exports.bucket = cluster.openBucket('default');
module.exports.cbErrors = couchbase.errors;
