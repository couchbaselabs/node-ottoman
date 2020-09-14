import { CollectionExistsError, ScopeExistsError } from 'couchbase';
import { createModel } from '../model/create-model';
import { DEFAULT_COLLECTION, DEFAULT_SCOPE } from '../utils/constants';
import { Schema } from '../schema';
import { ModelTypes } from '../model/model.types';
import { isDebugMode } from '../utils/is-debug-mode';
import { getModelMetadata } from '..';
import { ensureIndexes as ensureIndexesFn } from '../model/index/ensure-indexes';

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
  getModel(name: string): ModelTypes {
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

  /**
   * Start ottoman creating scopes and collection if they don't exist
   * @param ensureIndexes is a flag to define if ensure that all indexes are created in the server
   * @param useCollections is a flag to create scopes/collections.
   * @returns
   */
  async start({
    ensureIndexes = true,
    useCollections = false,
  }: {
    ensureIndexes?: boolean;
    useCollections?: boolean;
  } = {}): Promise<void> {
    if (useCollections) {
      const scopePromises = new Map();
      const collectionPromises = new Map();
      for (const key in this.models) {
        if (this.models[key]) {
          const metadata = getModelMetadata(this.models[key]);
          const { scopeName, collectionName, maxExpiry } = metadata;

          if (scopeName !== '_default') {
            scopePromises.set(
              scopeName,
              this.collectionManager
                .createScope(scopeName)
                .then(() => console.log('Scope created: ', scopeName))
                .catch((e) => {
                  if (!(e instanceof ScopeExistsError)) {
                    console.error(e);
                  }
                }),
            );
          }
          if (collectionName !== '_default') {
            collectionPromises.set(
              `${scopeName}${collectionName}`,
              this.collectionManager
                .createCollection({
                  name: collectionName,
                  scopeName,
                  maxExpiry: +maxExpiry,
                })
                .then(() => console.log(`collection created: ${scopeName}/${collectionName}`))
                .catch((e) => {
                  if (!(e instanceof CollectionExistsError)) {
                    console.error(e);
                  }
                }),
            );
          }
        }
      }
      for await (const scope of scopePromises.values()) {
        if (isDebugMode()) {
          console.log(scope);
        }
      }

      delay(1000);

      for await (const collection of collectionPromises.values()) {
        if (isDebugMode()) {
          console.log(collection);
        }
      }
    }

    if (ensureIndexes) {
      await ensureIndexesFn(this);
    }
  }
}

const delay = (timems) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timems);
  });
