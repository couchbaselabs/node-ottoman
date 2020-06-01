import couchbase from 'couchbase';
import { extractConnectionString } from '../utils/extract-connection-string';
import { ConnectionManager } from './connection-mannager';

export interface ConnectOptions {
  connectionString: string;
  username: string;
  password: string;
  bucketName: string;
}

/**
 * Store default connection
 */
export let __conn: ConnectionManager;

/**
 * Connect to Couchbase server
 */
export const connect = (connectOptions: ConnectOptions | string) => {
  const { connectionString, password, username, bucketName } =
    typeof connectOptions === 'object' ? connectOptions : extractConnectionString(connectOptions);
  const cluster = new couchbase.Cluster(connectionString, {
    username,
    password,
  });
  const connection = new ConnectionManager(cluster, bucketName, couchbase);
  if (!__conn) {
    __conn = connection;
  }
  return connection;
};

/**
 * Get a given collection from default connection
 * or return default collection if collectionName is undefined
 */
export const getCollection = (collectionName?: string) => __conn.getCollection(collectionName);

/**
 * Create model from given name from default connection
 */
export const model = (name: string, schema) => __conn.model(name, schema);

/**
 * isModel
 */

/**
 * Close Couchbase connection
 */
export const closeConnection = () => __conn.close();
