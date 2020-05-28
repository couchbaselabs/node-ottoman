import couchbase from 'couchbase';
import { extractConnectionString } from '../utils/extract-connection-string';

export interface ConnectOptions {
  connectionString: string;
  username: string;
  password: string;
  bucketName: string;
}

class ConnectionManager {
  bucket;
  collections: { [key: string]: string } = {};

  constructor(public cluster, public bucketName: string) {
    this.bucket = cluster.bucket(bucketName);
  }

  getCollection(collectionName = 'default') {
    let collection = this.collections[collectionName];
    if (!collection) {
      collection = collectionName ? this.bucket.collection(collectionName) : this.bucket.defaultCollection();
      this.collections[collectionName] = collection;
    }
    return collection;
  }

  close() {
    this.cluster.close();
  }
}

let instance;

export const connect = (connectOptions: string) => {
  const { connectionString, password, username, bucketName } =
    typeof connectOptions === 'object' ? connectOptions : extractConnectionString(connectOptions);
  const cluster = new couchbase.Cluster(connectionString, {
    username,
    password,
  });
  const connection = new ConnectionManager(cluster, bucketName);
  if (!instance) {
    instance = connection;
  }
  return connection;
};

export const getCollection = (collectionName?: string) => {
  return instance.getCollection(collectionName);
};

export const closeConnection = () => {
  instance.close();
};
