import {createModel} from '../model/create-model';
import {Model} from "../model/model";

/**
 * Define Couchbase connection class
 * Allow create a connection instance
 * Provide functions to work with the cluster and bucket on current connection
 * Support multiple instance
 */
export class ConnectionManager {
  /**
   * Store intance to a bucket
   */
  bucket;
  
  /**
   * Dictionary for all models create on this connection
   */
  models = {};

  constructor(public cluster, public bucketName: string, public couchbase) {
    this.bucket = cluster.bucket(bucketName);
  }
  
  /**
   * Return a Model constructor from the given name
   */
  getModel(name): Model | undefined {
    return this.models[name];
  }
  
  /**
   * Return a collection from the given collectionName in this bucket
   * Or default collection if collectionName is missing
   */
  getCollection(collectionName?) {
    return collectionName ? this.bucket.collection(collectionName) : this.bucket.defaultCollection();
  }
  
  /**
   * Create a Model on this connection
   */
  model(name, schema?, options?) {
    // if (this.models[name]) {
    //   throw new Error(`Model with name ${name}, already exist`);
    // }
    const ModelFactory = createModel({ name, schema, options, connection: this });
    this.models[name] = ModelFactory;
    return ModelFactory;
  }
  
  /**
   * Close connection
   */
  close() {
    this.cluster.close();
  }
}
