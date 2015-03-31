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

ottoman.bucket = bucket;
module.exports.lib = ottoman;

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

module.exports.cbErrors = couchbase.errors;
