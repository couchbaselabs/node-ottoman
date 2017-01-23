'use strict';

// TODO: Make this an interface instead...

function StoreAdapter() {
}

/*
TODO: Do this
Index:
  {Model} model
  {string} name
  {OttoPath[]} fields
 */

/**
 *
 * @param {Index[]} indices
 */
StoreAdapter.prototype.ensureIndexes = function(indices) {

};

StoreAdapter.prototype.load = function(mdlInst, callback) {

};

StoreAdapter.prototype.store = function(mdlInst, callback) {

};

StoreAdapter.prototype.remove = function(mdlInst, callback) {

};

/**
 * @callback CountCallback
 * @param {Error} err
 * @param {number} count
 */

/**
 *
 * @param {Model} ModelType
 * @param {Object} options
 * @param {string} [options.index]
 * @param {Expression} [options.filter]
 * @param {number} [options.skip]
 * @param {number} [options.limit]
 * @param {CountCallback} callback
 */
StoreAdapter.prototype.count = function(ModelType, options, callback) {

};

/**
 * @callback QueryCallback
 * @param {Error} err
 * @param {ModelInstance[]} models
 */

/**
 *
 * @param {Model} ModelType
 * @param {Object} options
 * @param {string} [options.index]
 * @param {Expression} [options.filter]
 * @param {QueryCallback} callback
 */
StoreAdapter.prototype.query = function(ModelType, options, callback) {

};


module.exports = StoreAdapter;
