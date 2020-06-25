import couchbase from 'couchbase';
import { extractConnectionString } from '../utils/extract-connection-string';
import { ConnectionManager } from './connection-manager';

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

export const getDefaultConnection = (): ConnectionManager => __conn;
export const getConnections = (): ConnectionManager[] => __connections;

/**
 * Connect to Couchbase server
 */
export const connect = (connectOptions: ConnectOptions | string) => {
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
 * Allow connecting from env variable OTTOMAN_CONNECTION_STRING if provided.
 */
const connectFromEnvVariables = (modelName: string) => {
  const connString = process.env.OTTOMAN_CONNECTION_STRING || '';
  if (connString) {
    connect(connString);
    console.log(`Database connect from process.env.OTTOMAN_CONNECTION_STRING`);
  } else {
    throw new Error(`There isn't a connection available to create Model ${modelName}`);
  }
};

/**
 * Get a given collection from default connection
 * or return default collection if collectionName is undefined
 */
export const getCollection = (collectionName?: string) => __conn.getCollection(collectionName);

/**
 * Create a model from a given name, from default connection
 */
export const model = (name: string, schema, options?) => {
  if (!__conn) {
    connectFromEnvVariables(name);
  }
  return __conn.model(name, schema, options);
};

/**
 * Close Couchbase connection
 */
export const closeConnection = () => __conn.close();
