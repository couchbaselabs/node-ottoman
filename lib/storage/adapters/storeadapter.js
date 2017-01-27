'use strict';

/**
 *
 * @interface
 */
function StoreAdapter() {
}

/**
 *
 * @param {Ottoman} context
 */
StoreAdapter.prototype.ensureIndexes = function(context) {
  throw new Error('not implemented');
};

/**
 * @callback LoadCallback
 * @param {Error} err
 */

/**
 *
 * @param {ModelInstance} mdlInst
 * @param {LoadCallback} callback
 */
StoreAdapter.prototype.load = function(mdlInst, callback) {
  throw new Error('not implemented');
};

/**
 * @callback StoreCallback
 * @param {Error} err
 */

/**
 *
 * @param {ModelInstance} mdlInst
 * @param {StoreCallback} callback
 */
StoreAdapter.prototype.store = function(mdlInst, callback) {
  throw new Error('not implemented');
};

/**
 * @callback RemoveCallback
 * @param {Error} err
 */

/**
 *
 * @param {ModelInstance} mdlInst
 * @param {RemoveCallback} callback
 */
StoreAdapter.prototype.remove = function(mdlInst, callback) {
  throw new Error('not implemented');
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
 * @param {CountCallback} callback
 */
StoreAdapter.prototype.count = function(ModelType, options, callback) {
  throw new Error('not implemented');
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
 * @param {number} [options.skip]
 * @param {number} [options.limit]
 * @param {QueryCallback} callback
 */
StoreAdapter.prototype.query = function(ModelType, options, callback) {
  throw new Error('not implemented');
};


module.exports = StoreAdapter;
