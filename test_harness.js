var Couchbase = require('couchbase');

var MOCK_LOGGING = false;

function BucketMock() {
  this.values = {};
  this.casIdx = 1;
}
BucketMock.cbError = function(code, message) {
  var err = new Error(message);
  err.code = code;
  return err;
};
BucketMock.prototype.set = function(key, value, options, callback) {
  var self = this;
  process.nextTick(function(){
    if (MOCK_LOGGING) console.log('BucketMock::set', key, options.cas, JSON.stringify(value));
    if (options && options.cas) {
      if (self.values[key] && self.values[key].cas != options.cas) {
        return callback(new Error());
      }
    }
    self.values[key] = {
      value: JSON.stringify(value),
      cas: {k:self.casIdx++}
    };
    callback(null);
  });
};
BucketMock.prototype.get = function(key, options, callback) {
  var self = this;
  process.nextTick(function(){
    if (!self.values[key]) {
      if (MOCK_LOGGING) console.log('BucketMock::get', key, 'err::not_found');


      return callback(BucketMock.cbError(Couchbase.errors.keyNotFound));
    }

    var result = {
      value: JSON.parse(self.values[key].value),
      cas: self.values[key].cas
    };
    if (MOCK_LOGGING) console.log('BucketMock::get', key, result);
    callback(null, result);
  });
}
module.exports.BucketMock = BucketMock;


var uniqueIdCounter = 0;
function uniqueId(prefix) {
  return prefix + (uniqueIdCounter++);
}
module.exports.uniqueId = uniqueId;

module.exports.bucket = new BucketMock();
//module.exports.bucket = new Couchbase.Connection({});

module.exports.cbErrors = Couchbase.errors;
