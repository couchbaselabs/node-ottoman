'use strict';

// TODO: Make this an interface instead...

function StoreAdapter() {
}

/**
 *
 * @param {ModelDb} context
 */
StoreAdapter.prototype.ensureModels = function(context) {

};

StoreAdapter.prototype.load = function(mdlInst, callback) {

};

StoreAdapter.prototype.store = function(mdlInst, callback) {

};

StoreAdapter.prototype.remove = function(mdlInst, callback) {

};

StoreAdapter.prototype.count = function(ModelType, options, callback) {

};

StoreAdapter.prototype.query = function(ModelType, options, callback) {

};


module.exports = StoreAdapter;
