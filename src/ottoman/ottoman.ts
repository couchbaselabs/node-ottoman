import * as couchbase from 'couchbase';
import { extractConnectionString } from '../utils/extract-connection-string';
import { Schema } from '../schema';
import { createModel } from '../model/create-model';
import {
  DEFAULT_COLLECTION,
  DEFAULT_ID_KEY,
  DEFAULT_MAX_EXPIRY,
  DEFAULT_SCOPE,
  KEY_GENERATOR,
  KEY_GENERATOR_DELIMITER,
  MODEL_KEY,
  validateDelimiter,
} from '../utils/constants';
import { getModelMetadata, ModelTypes, SearchConsistency } from '..';
import { isDebugMode } from '../utils/is-debug-mode';
import { CreateModelOptions, ModelOptions } from '../model/interfaces/create-model.interface';
import { ModelMetadata } from '../model/interfaces/model-metadata.interface';
import { ensureN1qlIndexes } from '../model/index/n1ql/ensure-n1ql-indexes';
import { buildMapViewIndexFn } from '../model/index/view/build-map-view-index-fn';
import { ensureViewIndexes } from '../model/index/view/ensure-view-indexes';
import { OttomanError } from '../exceptions/ottoman-errors';
import { parseError } from '../utils/parse-errors';
import {
  Bucket,
  BucketManager,
  Cluster,
  CollectionManager,
  DropBucketOptions,
  DropCollectionOptions,
  DropScopeOptions,
  QueryOptions,
  ConnectOptions as CouchbaseConnectOptions,
  NoopTracer,
  NoopMeter,
  QueryIndexManager,
  ViewIndexManager,
  Collection,
  NodeCallback,
} from 'couchbase';
import { generateUUID } from '../utils/generate-uuid';

export interface ConnectOptions extends CouchbaseConnectOptions {
  connectionString: string;
  bucketName: string;
}

interface OttomanConfig {
  collectionName?: string;
  retryCount?: number;
  scopeName?: string;
  idKey?: string;
  modelKey?: string;
  populateMaxDeep?: number;
  consistency?: SearchConsistency;
  maxExpiry?: number;
  keyGenerator?: (params: { metadata: ModelMetadata }) => string;
  keyGeneratorDelimiter?: string;
}

interface EnsureIndexesOptions {
  ignoreWatchIndexes?: boolean;
}

interface StartOptions {
  ignoreWatchIndexes?: boolean;
}

export type OttomanEvents = 'IndexOnline';

/**
 * Store default connection.
 */
export let __ottoman: Ottoman;
export let __ottomanInstances: Ottoman[] = [];

export class Ottoman {
  private n1qlIndexes: Record<string, { fields: string[]; modelName: string }> = {};
  private viewIndexes: Record<string, { views: { map?: string } }> = {};
  private refdocIndexes: Record<string, { fields: string[] }[]> = {};
  private readonly id: string;
  private events: Record<OttomanEvents, NodeCallback<Ottoman>[]> = {
    IndexOnline: [],
  };
  indexOnline: Error | boolean = false;
  indexOnlinePromise: Promise<any> | undefined;

  /**
   * Retrieve all register callbacks to "IndexOnline" event
   */
  get indexReadyHooks() {
    return this.events['IndexOnline'];
  }

  /**
   * Register Ottoman events
   * @param event the name of the event you want to listen to.
   * @param fn callback function to be executed when the event trigger up.
   */
  on(event: OttomanEvents, fn: NodeCallback<Ottoman>) {
    switch (event) {
      case 'IndexOnline':
        this.events.IndexOnline.push(fn);
        if (this.indexOnline) {
          setTimeout(() => fn(this.indexOnline instanceof Error ? this.indexOnline : null, this));
        }
        break;
    }
  }
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
  bucket?: Bucket;

  /**
   * CollectionManager allows the management of collections within a Bucket.
   *
   * Check the
   * [Collection Manager Couchbase SDK API](https://docs.couchbase.com/sdk-api/couchbase-node-client/classes/CollectionManager.html)
   * documentation for more details.
   */
  get collectionManager(): CollectionManager {
    return this.bucket!.collections();
  }

  /**
   * Gets a bucket manager for this cluster.
   *
   * Check the
   * [Bucket Manager Couchbase SDK API](https://docs.couchbase.com/sdk-api/couchbase-node-client/classes/BucketManager.html)
   * documentation for more details.
   */
  get bucketManager(): BucketManager {
    return this.cluster.buckets();
  }

  /**
   * QueryIndexManager provides an interface for managing the query indexes on the cluster.
   *
   * Check the
   * [Query Index Manager Couchbase SDK API](https://docs.couchbase.com/sdk-api/couchbase-node-client/classes/QueryIndexManager.html)
   * documentation for more details.
   */
  get queryIndexManager(): QueryIndexManager {
    return this.cluster.queryIndexes();
  }

  /**
   * ViewIndexManager is an interface which enables the management of view indexes on the cluster.
   *
   * @deprecated
   * Check the
   * [View Index Manager Couchbase SDK API](https://docs.couchbase.com/sdk-api/couchbase-node-client/classes/ViewIndexManager.html)
   * documentation for more details.
   */
  get viewIndexManager(): ViewIndexManager {
    return this.bucket!.viewIndexes();
  }

  /**
   * Dictionary for all models registered on this connection.
   */
  models = {};

  private _cluster?: Cluster;

  /**
   * Cluster represents an entire Couchbase Server cluster.
   */
  get cluster(): Cluster {
    return this._cluster!;
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
    if (config.keyGeneratorDelimiter) {
      validateDelimiter(config.keyGeneratorDelimiter);
    }
    this.id = generateUUID();
    this.config = config;
    if (!__ottoman) {
      __ottoman = this;
    }
    __ottomanInstances.push(this);
  }

  /**
   * Connect to Couchbase server.
   * @example
   * ```javascript
   *  import { connect } from "ottoman";
   *  const connection = connect("couchbase://localhost/travel-sample@admin:password");
   * ```
   */
  connect = async (connectOptions: ConnectOptions | string): Promise<Ottoman> => {
    const options = typeof connectOptions === 'object' ? connectOptions : extractConnectionString(connectOptions);

    // temporary solution to segmentation fault, this code will be removed after brett notification.
    if (!options.tracer) {
      options.tracer = new NoopTracer();
    }
    if (!options.meter) {
      options.meter = new NoopMeter();
    }

    const { connectionString, bucketName, ..._options } = options;
    this._cluster = await Cluster.connect(connectionString, _options);
    this.bucketName = bucketName;
    this.couchbase = couchbase;
    this.bucket = this._cluster!.bucket(bucketName);
    return this;
  };

  /**
   * Creates a Model on this connection.
   * @example
   * ```javascript
   * const User = connection.model('User', { name: String }, { collectionName: 'users' });
   * ```
   */
  model<T = any, R = any>(
    name: string,
    schema: Schema | Record<string, unknown>,
    options: ModelOptions = {},
  ): ModelTypes<T> {
    if (this.models[name]) {
      throw new OttomanError(`A model with name '${name}' has already been registered.`);
    }
    if (options.keyGeneratorDelimiter) {
      validateDelimiter(options.keyGeneratorDelimiter);
    }
    const modelOptions = options as CreateModelOptions;
    modelOptions.collectionName = options.collectionName || this.config.collectionName || name;
    modelOptions.scopeName = options.scopeName || this.config.scopeName || DEFAULT_SCOPE;
    modelOptions.keyGenerator = options.keyGenerator || this.config.keyGenerator || KEY_GENERATOR;
    modelOptions.keyGeneratorDelimiter =
      options.keyGeneratorDelimiter || this.config.keyGeneratorDelimiter || KEY_GENERATOR_DELIMITER;
    modelOptions.modelKey = options.modelKey || this.config.modelKey || MODEL_KEY;
    modelOptions.idKey = options.idKey || this.config.idKey || DEFAULT_ID_KEY;
    modelOptions.maxExpiry = options.maxExpiry || this.config.maxExpiry || DEFAULT_MAX_EXPIRY;

    const ModelFactory = createModel<T, R>({ name, schemaDraft: schema, options: modelOptions, ottoman: this });
    this.models[name] = ModelFactory;
    return ModelFactory;
  }

  /**
   * dropCollection drops a collection from a scope in a bucket.
   * @param collectionName
   * @param scopeName
   * @param options
   */
  async dropCollection(
    collectionName: string,
    scopeName: string,
    options: DropCollectionOptions = {},
  ): Promise<boolean | undefined | void> {
    try {
      return await this.collectionManager.dropCollection(collectionName, scopeName, options);
    } catch (e) {
      parseError(e, { collectionName, scopeName });
    }
  }

  /**
   * dropScope drops a scope from a bucket.
   * @param scopeName
   * @param options
   */
  async dropScope(scopeName: string, options: DropScopeOptions = {}): Promise<boolean | undefined | void> {
    try {
      return await this.collectionManager.dropScope(scopeName, options);
    } catch (e) {
      parseError(e, { scopeName });
    }
  }

  /**
   * dropBucket drops a bucket from the cluster.
   * @param bucketName
   * @param options
   */
  async dropBucket(bucketName: string, options: DropBucketOptions = {}): Promise<boolean | undefined | void> {
    try {
      return await this.bucketManager.dropBucket(bucketName, options);
    } catch (e) {
      parseError(e, { bucketName });
    }
  }

  /**
   * Returns a Model constructor from the given model name.
   *
   * @example
   * ```javascript
   * const User = connection.getModel('User');
   * ```
   */
  getModel<T = any>(name: string): ModelTypes<T> {
    return this.models[name];
  }

  /**
   * Return a collection from the given collectionName in this bucket
   * or default collection if collectionName is missing.
   */
  getCollection(collectionName = DEFAULT_COLLECTION, scopeName = DEFAULT_SCOPE): Collection {
    return this.bucket!.scope(scopeName === '_default' ? '' : scopeName).collection(
      collectionName === '_default' ? '' : collectionName,
    );
  }

  /**
   * Closes the current connection.
   *
   * @example
   * ```javascript
   * connection.close().then(() => console.log('connection closed'));
   * ```
   */
  async close(): Promise<void> {
    if (this.cluster) {
      await this.cluster.close();
      __ottomanInstances = __ottomanInstances.filter((instance) => instance.id !== this.id);
      if (__ottoman?.id === this.id) {
        (__ottoman as any) = undefined;
      }
    }
  }

  /**
   * Executes N1QL Queries.
   *
   * Ottoman provides a powerful [Query Builder](/guides/query-builder) system to create valid N1QL queries using method chaining.
   * See the example below:
   *
   * @example
   * ```js
   * const expr_where = {
   *   $or: [
   *     { address: { $like: '%57-59%' } },
   *     { free_breakfast: true }
   *   ]
   * };
   * const query = new Query({}, 'travel-sample');
   * const n1qlQuery = query.select([{ $field: 'address' }])
   *    .where(expr_where)
   *    .build()
   *
   * connection.query(n1qlQuery).then(result => console.log( result ))
   * ```
   * The above example will run this query:
   * ```sql
   * SELECT address
   * FROM `travel-sample`
   * WHERE (address LIKE '%57-59%' OR free_breakfast = true)
   * ```
   */
  async query(query: string, options: QueryOptions = {}) {
    return this.cluster.query(query, options);
  }

  /**
   * `ensureCollections` will attempt to create scopes and collections to map your models to in Couchbase Server.
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
              .then(() => {
                if (isDebugMode()) {
                  console.info('Scope created: ', scopeName);
                }
              })
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
            tryCreateCollection(
              { collectionName, scopeName, maxExpiry, collectionManager: this.collectionManager },
              this.config.retryCount,
            ),
          );
        }
      }
    }

    // eslint-disable-next-line no-unused-vars
    for await (const scope of scopePromises.values()) {
    }

    // eslint-disable-next-line no-unused-vars
    for await (const collection of collectionPromises.values()) {
    }
  }

  /**
   * `ensureIndexes` will attempt to create indexes defined in your schema if they do not exist.
   * * @param options
   * - `ignoreWatchIndexes`: by default `ensureIndexes` function will wait for indexes, but you can disabled it setting ignoreWatchIndexes to true.
   */
  async ensureIndexes(options: EnsureIndexesOptions = {}) {
    await ensureN1qlIndexes(this, this.n1qlIndexes);
    await ensureViewIndexes(this, this.viewIndexes);

    if (!options.ignoreWatchIndexes && this.indexOnlinePromise) {
      return this.indexOnlinePromise;
    }
  }

  /**
   * `start` method is just a shortcut to run `ensureCollections` and `ensureIndexes`.
   * @param options
   * - `ignoreWatchIndexes`: by default `start` function will wait for indexes, but you can disabled it setting ignoreWatchIndexes to true.
   *
   * Notice: It's not required to execute the `start` method in order for Ottoman work.
   */
  async start(options: StartOptions = {}) {
    await this.ensureCollections();
    await this.ensureIndexes(options);
  }
}

const delay = (timems) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timems);
  });

const createCollection = ({ collectionManager, collectionName, scopeName, maxExpiry }) => {
  return collectionManager
    .createCollection({
      name: collectionName,
      scopeName,
      maxExpiry: maxExpiry ? +maxExpiry : DEFAULT_MAX_EXPIRY,
    })
    .then(() => {
      if (isDebugMode()) {
        console.info(`collection created: ${scopeName}/${collectionName}`);
      }
    });
};

const tryCreateCollection = async (
  { collectionManager, collectionName, scopeName, maxExpiry },
  retries = 3,
  delayMS = 5000,
) => {
  let collectionDoesNotExists = true;
  let err = null;
  let tryDelay = 0;
  let tryCount = 0;
  while (collectionDoesNotExists && tryCount < retries + 1) {
    await delay(tryDelay);
    try {
      await createCollection({ collectionManager, collectionName, scopeName, maxExpiry });
    } catch (e) {
      if (e instanceof (couchbase as any).CollectionExistsError) collectionDoesNotExists = false;
      err = e;
    }
    tryDelay += Math.max(Math.min(tryDelay * 10, delayMS), 100);
    tryCount++;
  }
  if (collectionDoesNotExists && err) throw new Error(err);
};

export const getDefaultInstance = () => __ottoman;
export const getOttomanInstances = () => __ottomanInstances;
export const connect = (connectOptions: ConnectOptions | string) => {
  if (!__ottoman) {
    new Ottoman();
  }
  __ottoman && __ottoman.connect(connectOptions);
};
export const close = async (): Promise<void> => {
  if (__ottoman) {
    await __ottoman.close();
  }
};
export const start = () => __ottoman && __ottoman.start();
export const getModel = (name: string) => __ottoman && __ottoman.getModel(name);
export const getCollection = (collectionName = DEFAULT_COLLECTION, scopeName = DEFAULT_SCOPE) =>
  __ottoman && __ottoman.getCollection(collectionName, scopeName);
export const model = <T = any, R = any>(
  name: string,
  schema: Schema | Record<string, unknown>,
  options?: ModelOptions,
): ModelTypes<T> => __ottoman && __ottoman.model<T, R>(name, schema, options);
