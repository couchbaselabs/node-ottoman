'use strict';

var util = require('util');
var KvStoreAdapter = require('./../kv/kvstoreadapter');

function CbStoreAdapter() {
  KvStoreAdapter.call(this);
}
util.inherits(KvStoreAdapter, KvStoreAdapter);

module.exports = CbStoreAdapter;
