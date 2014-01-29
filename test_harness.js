var Couchbase = require('couchbase');

var uniqueIdCounter = 0;
function uniqueId(prefix) {
  return prefix + (uniqueIdCounter++);
}
module.exports.uniqueId = uniqueId;

module.exports.bucket = new Couchbase.Mock.Connection({});
//module.exports.bucket = new Couchbase.Connection({});

module.exports.cbErrors = Couchbase.errors;
