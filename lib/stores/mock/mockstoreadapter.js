'use strict';

var util = require('util');
var KvStoreAdapter = require('./../kv/kvstoreadapter');

function MockStoreAdapter() {
  KvStoreAdapter.call(this);
}
util.inherits(MockStoreAdapter, KvStoreAdapter);

module.exports = MockStoreAdapter;
