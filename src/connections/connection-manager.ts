import { createModel } from '../model/create-model';
import { DEFAULT_COLLECTION, DEFAULT_SCOPE } from '../utils/constants';
import { Schema } from '../schema';

/**
 * Creates a connection instance.
 * Provide functions to work with cluster, bucket and collection on the current connection.
 * Supports multiple instances.
 *
 * @example
 * ```javascript
 *  import { connect } from "ottoman";
 *  const connection: ConnectionManager
 *                        = connect("couchbase://localhost/travel-sample@admin:password");
 *  ```
 */
export class ConnectionManager {
  /**
   * Bucket represents a storage grouping of data within a Couchbase Server cluster.
   */
  bucket;

  /**
   * CollectionManager allows the management of collections within a Bucket.
   */
  collectionManager;

  /**
   * QueryIndexManager provides an interface for managing the query indexes on the cluster.
   */
  queryIndexManager;

  /**
   * ViewIndexManager is an interface which enables the management of view indexes on the cluster.
   */
  viewIndexManager;

  /**
   * Dictionary for all models registered on this connection.
   */
  models = {};

  /**
   * Cluster represents an entire Couchbase Server cluster.
   */
  cluster;

  /**
   * Contains the name of the current bucket.
   */
  bucketName: string;

  /**
   * Stores a reference to couchbase instance.
   */
  couchbase;

  constructor(cluster, bucketName: string, couchbase) {
    this.cluster = cluster;
    this.bucketName = bucketName;
    this.couchbase = couchbase;
    this.bucket = cluster.bucket(bucketName);
    this.collectionManager = this.bucket.collections();
    this.viewIndexManager = this.bucket.viewIndexes();
    this.queryIndexManager = this.cluster.queryIndexes();
  }

  /**
   * Creates a Model on this connection.
   *
   * @example
   * ```javascript
   * const User = connection.model('User', { name: String }, {collectionName: 'users'});
   * ```
   */
  model(name: string, schema: Schema | Record<string, unknown>, options?) {
    const ModelFactory = createModel({ name, schemaDraft: schema, options, connection: this });
    this.models[name] = ModelFactory;
    return ModelFactory;
  }

  /**
   * Returns a Model constructor from the given name
   *
   * @example
   * ```javascript
   * const User = connection.getModel('User');
   * ```
   */
  getModel(name: string) {
    return this.models[name];
  }

  /**
   * Return a collection from the given collectionName in this bucket
   * Or default collection if collectionName is missing
   */
  getCollection(collectionName = DEFAULT_COLLECTION, scopeName = DEFAULT_SCOPE) {
    return this.bucket.scope(scopeName).collection(collectionName);
  }

  /**
   * Closes the current connection
   *
   * @example
   * ```javascript
   * connection.close().then(() => console.log('connection closed'));
   * ```
   */
  close() {
    this.cluster.close();
  }

  /**
   * Executes N1QL Queries.
   *
   * Ottoman provides a powerful [Query Builder](/guides/query-builder) system to create valid N1QL queries in a easier way.
   * See the example below:
   *
   * @example
   * ```javascript
   * const expr_where = {$or: [{ address: { $like: '%57-59%' } }, { free_breakfast: true }]};
   * const query = new Query({}, 'travel-sample');
   * const n1qlQuery = query.select([{$field: 'address'}]).where(expr_where).build()
   *
   * connection.query(n1qlQuery).then(result => console.log(result))
   * ```
   * The above example will run this query:
   * > `SELECT address FROM travel-sample WHERE (address LIKE '%57-59%' OR free_breakfast = true)`
   */
  async query(query: string) {
    return this.cluster.query(query);
  }
}
