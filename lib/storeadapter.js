'use strict';

/**
 * Defines the degree of consistency required for a particular query.
 * @readonly
 * @enum {number}
 */
var SearchConsistency = {
  /**
   * No degree consistency required
   */
  NONE: 0,

  /**
   * Operations performed by this ottoman instance will be reflected
   *   in queries performed by this particular ottoman instance.  This
   *   type of consistency will be slower than no consistency, but faster
   *   than GLOBAL as the index state is tracked internally rather than
   *   requested from the server.
   */
  LOCAL: 1,

  /**
   * Operations performed by any client of the Couchbase Server up to the
   *   time of the queries dispatch will be reflected in any index results.
   *   This is the slowest of all consistency levels as it requires that the
   *   server synchronize its indexes to the current key-value state prior to
   *   execution of the query.
   */
  GLOBAL: 2
};

/**
 * A store adapter is the low-level provider of database functionality for
 *   Ottoman's internal storage system.
 *
 * @constructor
 */
function StoreAdapter() {
}

StoreAdapter.SearchConsistency = SearchConsistency;

/**
 * This callback is invoked by store adapter get operations.
 *
 * @callback StoreAdapter~GetCallback
 * @param {Error} err
 *   Any errors that occured during the processing of the request.
 * @param {Object} value
 *   The value of the requested document
 * @param {Object} cas
 *   An opaque identifier representing the current state of this document.
 */

/**
 * This callback is invoked by store adapter store operations.
 *
 * @callback StoreAdapter~StoreCallback
 * @param {Error} err
 *   Any errors that occured during the processing of the request.
 * @param {Object} cas
 *   An opaque identifier representing the current state of this document.
 */

/**
 * This callback is invoked by store adapter remove operations.
 *
 * @callback StoreAdapter~RemoveCallback
 * @param {Error} err
 *   Any errors that occured during the processing of the request.
 */

/**
 * This callback is invoked by store adapter search operations.
 *
 * @callback StoreAdapter~SearchCallback
 * @param {Error} err
 *   Any errors that occured during the processing of the request.
 * @param {Object[]} results
 *   A list of result documents from the search.
 */

/**
 * This callback is invoked by store adapter createIndex operations.
 *
 * @callback StoreAdapter~CreateIndexCallback
 * @param {Error} err
 *   Any errors that occured during the processing of the request.
 */

/**
 * This callback is invoked by store adapter ensure operations.
 *
 * @callback StoreAdapter~EnsureCallback
 * @param {Error} err
 *   Any errors that occured during the processing of the request.
 */

module.exports = StoreAdapter;
