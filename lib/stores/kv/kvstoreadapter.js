'use strict';

var util = require('util');
var StoreAdapter = require('./../storeadapter');

function KvStoreAdapter() {
  StoreAdapter.call(this);
}
util.inherits(KvStoreAdapter, StoreAdapter);

module.exports = KvStoreAdapter;
