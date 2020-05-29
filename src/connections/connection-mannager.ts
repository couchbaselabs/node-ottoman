import { model } from '../model/model';

/**
 * Define Couchbase connection class
 * Allow create a connection instance
 * Provide functions to work with the cluster and bucket on current connection
 * Support multiple instance
 */
export class ConnectionManager {
  bucket;

  constructor(public cluster, public bucketName: string, public couchbase) {
    this.bucket = cluster.bucket(bucketName);
  }

  getCollection(collectionName?) {
    return collectionName ? this.bucket.collection(collectionName) : this.bucket.defaultCollection();
  }

  model(name, schema?, options?) {
    const collection = this.getCollection(name);
    return model({ collection, schema, connection: this, options });
  }

  close() {
    this.cluster.close();
  }
}
