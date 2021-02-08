import * as couchbase from 'couchbase';
import { extractConnectionString } from '../utils/extract-connection-string';
import { Schema } from '../schema';
import { createModel } from '../model/create-model';
import { ModelTypes } from '../model/model.types';
import {
  DEFAULT_COLLECTION,
  DEFAULT_MAX_EXPIRY,
  DEFAULT_SCOPE,
  KEY_GENERATOR,
  MODEL_KEY,
  DEFAULT_ID_KEY,
} from '../utils/constants';
import { getModelMetadata, SearchConsistency } from '..';
import { isDebugMode } from '../utils/is-debug-mode';
import { ModelOptions, CreateModelOptions } from '../model/interfaces/create-model.interface';
import { ModelMetadata } from '../model/interfaces/model-metadata.interface';
import { ensureN1qlIndexes } from '../model/index/n1ql/ensure-n1ql-indexes';
import { buildMapViewIndexFn } from '../model/index/view/build-map-view-index-fn';
import { ensureViewIndexes } from '../model/index/view/ensure-view-indexes';

export interface ConnectOptions {
  connectionString: string;
  username: string;
  password: string;
  bucketName: string;
  authenticator?: CertificateAuthenticator;
  trustStorePath?: string;
  transcoder?: unknown;
  logFunc?: unknown;
}

interface OttomanConfig {
  collectionName?: string;
  scopeName?: string;
  modelKey?: string;
  populateMaxDeep?: number;
  searchConsistency?: SearchConsistency;
  maxExpiry?: number;
  keyGenerator?: (params: { metadata: ModelMetadata }) => string;
}

/**
 * CertificateAuthenticator provides an authenticator implementation
 * which uses TLS Certificate Authentication.
 */
export class CertificateAuthenticator {
  /**
   *
   * @param {string} certificatePath
   * @param {string} keyPath
   */
  constructor(public certificatePath, public keyPath) {}
}

/**
 * Store default connection
 */
export let __ottoman: Ottoman;
export const __ottomanInstances: Ottoman[] = [];

export class Ottoman {
  private n1qlIndexes: Record<string, { fields: string[]; modelName: string }> = {};
  private viewIndexes: Record<string, { views: { map?: string } }> = {};
  private refdocIndexes: Record<string, { fields: string[] }[]> = {};

  /**
   * @ignore
   */
  getRefdocIndexByKey = (key) => this.refdocIndexes[key];

  /**
   * @ignore
   */
  registerIndex = (indexName: string, fields, modelName) => {
    this.n1qlIndexes[indexName] = { fields, modelName };
  };

  /**
   * @ignore
   */
  registerViewIndex = (designDocName: string, indexName: string, fields, metadata) => {
    const map = buildMapViewIndexFn(metadata, fields);
    if (!this.viewIndexes[designDocName]) {
      this.viewIndexes[designDocName] = { views: {} };
    }
    this.viewIndexes[designDocName].views[indexName] = { map };
  };

  /**
   * @ignore
   */
  registerRefdocIndex = (fields: string[], prefix: string) => {
    if (!this.refdocIndexes[prefix]) {
      this.refdocIndexes[prefix] = [];
    }
    this.refdocIndexes[prefix].push({ fields });
  };

  config: OttomanConfig;

  /**
   * Bucket represents a storage grouping of data within a Couchbase Server cluster.
   */
  bucket;

  /**
   * CollectionManager allows the management of collections within a Bucket.
   */
  get collectionManager() {
    return this.bucket.collections();
  }

  /**
   * Gets a bucket manager for this cluster
   */
  get bucketManager() {
    return this.cluster.buckets();
  }

  /**
   * QueryIndexManager provides an interface for managing the query indexes on the cluster.
   */
  get queryIndexManager() {
    return this.cluster.queryIndexes();
  }

  /**
   * ViewIndexManager is an interface which enables the management of view indexes on the cluster.
   */
  get viewIndexManager() {
    return this.bucket.viewIndexes();
  }

  /**
   * Dictionary for all models registered on this connection.
   */
  models = {};

  private _cluster;

  /**
   * Cluster represents an entire Couchbase Server cluster.
   */
  get cluster() {
    if (!this._cluster) {
      throw new Error('No active connection detected, please try to connect.');
    }
    return this._cluster;
  }

  /**
   * Contains the name of the current bucket.
   */
  bucketName = '';

  /**
   * Stores a reference to couchbase instance.
   */
  couchbase;

  constructor(config: OttomanConfig = {}) {
    this.config = config;
    if (!__ottoman) {
      __ottoman = this;
    }
    __ottomanInstances.push(this);
  }

  /**
   * Connect to Couchbase server
   * @example
   * ```javascript
   *  import { connect } from "ottoman";
   *  const connection = connect("couchbase://localhost/travel-sample@admin:password");
   * ```
   */
  connect = (connectOptions: ConnectOptions | string) => {
    const options = typeof connectOptions === 'object' ? connectOptions : extractConnectionString(connectOptions);
    const { connectionString, bucketName, ..._options } = options;
    this._cluster = new (couchbase as any).Cluster(connectionString, _options);
    this.bucketName = bucketName;
    this.couchbase = couchbase;
    this.bucket = this._cluster.bucket(bucketName);
    return this;
  };

  /**
   * Creates a Model on this connection.
   *
   * @example
   * ```javascript
   * const User = connection.model('User', { name: String }, {collectionName: 'users'});
   * ```
   */
  model(name: string, schema: Schema | Record<string, unknown>, options: ModelOptions = {}) {
    if (this.models[name]) {
      throw new Error(`A model with name '${name}' has already been registered.`);
    }
    const modelOptions = options as CreateModelOptions;
    modelOptions.collectionName = options.collectionName || this.config.collectionName || name;
    modelOptions.scopeName = options.scopeName || this.config.scopeName || DEFAULT_SCOPE;
    modelOptions.keyGenerator = options.keyGenerator || this.config.keyGenerator || KEY_GENERATOR;
    modelOptions.modelKey = options.modelKey || this.config.modelKey || MODEL_KEY;
    modelOptions.idKey = options.idKey || DEFAULT_ID_KEY;
    modelOptions.maxExpiry = options.maxExpiry || this.config.maxExpiry || DEFAULT_MAX_EXPIRY;

    const ModelFactory = createModel({ name, schemaDraft: schema, options: modelOptions, ottoman: this });
    this.models[name] = ModelFactory;
    return ModelFactory;
  }

  /**
   * dropCollection drops a collection from a scope in a bucket.
   * @param name
   * @param scopeName
   * @param options
   */
  dropCollection(collectionName, scopeName: string, options: { timeout?: number } = {}): Promise<boolean> {
    return this.collectionManager.dropCollection(collectionName, scopeName, options);
  }

  /**
   * dropScope drops a scope from a bucket.
   * @param scopeName
   * @param options
   */
  dropScope(scopeName: string, options: { timeout?: number } = {}): Promise<boolean> {
    return this.collectionManager.dropScope(scopeName, options);
  }

  /**
   * dropBucket drops a bucket from the cluster.
   * @param bucketName
   * @param options
   */
  dropBucket(bucketName: string, options: { timeout?: number } = {}): Promise<boolean> {
    return this.bucketManager.dropBucket(bucketName, options);
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
    return this.bucket
      .scope(scopeName === '_default' ? '' : scopeName)
      .collection(collectionName === '_default' ? '' : collectionName);
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
    this.cluster && this.cluster.close();
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
   * `ensureCollections` will attempt to create scopes and collection to map your models into Couchbase Server.
   */
  async ensureCollections() {
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
                if (!(e instanceof (couchbase as any).ScopeExistsError)) {
                  throw e;
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
                maxExpiry: maxExpiry ? +maxExpiry : DEFAULT_MAX_EXPIRY,
              })
              .then(() => console.log(`collection created: ${scopeName}/${collectionName}`))
              .catch((e) => {
                if (!(e instanceof (couchbase as any).CollectionExistsError)) {
                  throw e;
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

  /**
   * `ensureIndexes` will attempt to create indexes defined in your schemas
   */
  async ensureIndexes() {
    await ensureN1qlIndexes(this, this.n1qlIndexes);
    await ensureViewIndexes(this, this.viewIndexes);
  }

  /**
   * `start` method is just a shortcut to run `ensureCollections` and `ensureIndexes`.
   *  Notice: It's not required to execute the `start` method to Ottoman work.
   */
  async start() {
    await this.ensureCollections();
    await this.ensureIndexes();
  }
}

const delay = (timems) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timems);
  });

export const getDefaultInstance = () => __ottoman;
export const getOttomanIntances = () => __ottomanInstances;
export const connect = (connectOptions: ConnectOptions | string) => {
  if (!__ottoman) {
    new Ottoman();
  }
  __ottoman && __ottoman.connect(connectOptions);
};
export const close = () => {
  if (__ottoman) {
    __ottoman.close();
    (__ottoman as any) = undefined;
  }
};
export const start = () => __ottoman && __ottoman.start();
export const getModel = (name: string) => __ottoman && __ottoman.getModel(name);
export const getCollection = (collectionName = DEFAULT_COLLECTION, scopeName = DEFAULT_SCOPE) =>
  __ottoman && __ottoman.getCollection(collectionName, scopeName);
export const model = (name: string, schema: Schema | Record<string, unknown>, options?) =>
  __ottoman && __ottoman.model(name, schema, options);
