import { createModel } from '../model/create-model';
import { DEFAULT_COLLECTION, DEFAULT_SCOPE } from '../utils/constants';
import { Schema } from '../schema';

/**
 * Create a connection instance,
 * Provide functions to work with cluster, bucket, collection on the current connection,
 * support multiple instances.
 */
export class ConnectionManager {
  /**
   * Store instance to a bucket
   */
  bucket;

  /**
   * @ignore
   */
  collectionManager;

  /**
   * @ignore
   */
  queryIndexManager;

  /**
   * @ignore
   */
  viewIndexManager;

  /**
   * Dictionary for all models registered on this connection.
   */
  models = {};

  constructor(public cluster, public bucketName: string, public couchbase) {
    this.bucket = cluster.bucket(bucketName);
    this.collectionManager = this.bucket.collections();
    this.viewIndexManager = this.bucket.viewIndexes();
    this.queryIndexManager = this.cluster.queryIndexes();
  }

  /**
   * Create a Model on this connection.
   */
  model(name: string, schema: Schema | Record<string, unknown>, options?) {
    const ModelFactory = createModel({ name, schemaDraft: schema, options, connection: this });
    this.models[name] = ModelFactory;
    return ModelFactory;
  }

  /**
   * Return a Model constructor from the given name
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
   * Close current connection
   */
  close() {
    this.cluster.close();
  }
}
