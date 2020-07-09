import couchbase from 'couchbase';
import { extractConnectionString } from '../utils/extract-connection-string';
import { ConnectionManager } from './connection-manager';
import { Schema } from '../schema';
import { ModelOptions } from '../model/interfaces/create-model.interface';
import { Model } from '../model/model';

export interface ConnectOptions {
  connectionString: string;
  username: string;
  password: string;
  bucketName: string;
  clientCertificate?: string;
  certificateChain?: string;
  transcoder?: unknown;
  logFunc?: unknown;
}

/**
 * Store default connection
 */
export let __conn: ConnectionManager;
export const __connections: ConnectionManager[] = [];

export class Ottoman {
  /**
   * Returns default connection
   */
  getDefaultConnection = (): ConnectionManager => __conn;

  /**
   * Returns all active connections
   */
  getConnections = (): ConnectionManager[] => __connections;

  /**
   * Gets a given collection from default connection
   * or returns default collection if collectionName is undefined
   */
  getCollection = (collectionName?: string) => __conn.getCollection(collectionName);

  /**
   * Connect to Couchbase server
   * @example
   * ```javascript
   *  import { connect } from "ottoman";
   *  const connection = connect("couchbase://localhost/travel-sample@admin:password");
   * ```
   */
  connect = (connectOptions: ConnectOptions | string): ConnectionManager => {
    const { connectionString, password, username, bucketName } =
      typeof connectOptions === 'object' ? connectOptions : extractConnectionString(connectOptions);
    const cluster = new couchbase.Cluster(connectionString, { username, password });
    const connection = new ConnectionManager(cluster, bucketName, couchbase);
    if (!__conn) {
      __conn = connection;
    }
    __connections.push(connection);
    return connection;
  };

  /**
   * Creates a model from a given name, from default connection
   *
   * @example
   * ```javascript
   * import { connect, model } from "ottoman";
   * connect("couchbase://localhost/travel-sample@admin:password");
   *
   * const User = model('User', { name: String });
   * ```
   */
  // eslint-disable-next-line no-unused-vars
  model(name: string, schema: Schema | Record<string, any>, options: ModelOptions): Model {
    class ModelFactory extends Model {}
    return new ModelFactory({});
  }

  /**
   * Close Couchbase connection
   */
  closeConnection = () => __conn.close();
}

export const ottoman = new Ottoman();
Object.defineProperty(ottoman, 'model', {
  value: (name: string, schema, options?) => {
    if (!__conn) {
      connectFromEnvVariables(name);
    }
    return __conn.model(name, schema, options);
  },
});

/**
 * Allow connecting from env variable OTTOMAN_CONNECTION_STRING if provided.
 */
const connectFromEnvVariables = (modelName: string) => {
  const connString = process.env.OTTOMAN_CONNECTION_STRING || '';
  if (connString) {
    ottoman.connect(connString);
    console.log(`Database connect from process.env.OTTOMAN_CONNECTION_STRING`);
  } else {
    throw new Error(`There isn't a connection available to create Model ${modelName}`);
  }
};

const { connect, closeConnection, getCollection, getConnections, getDefaultConnection, model } = ottoman;
export { connect, closeConnection, getCollection, getConnections, getDefaultConnection, model };
