'use strict';

var util = require('util');
var StoreAdapter = require('./../storeadapter');

/**
 * _KvStoreData holds various pieces of useful information about the
 * state of items which were previous retrieved from a KV storage engine.
 *
 * @constructor
 * @private
 */
function _KvStoreData() {
  this.cas = null;
  this.key = null;
  this.refKeys = [];
}

/**
 *
 * @constructor
 * @augments StoreAdapter
 */
function KvStoreAdapter() {
  StoreAdapter.call(this);
}
util.inherits(KvStoreAdapter, StoreAdapter);



module.exports = KvStoreAdapter;
