import { TransactionAttemptContext } from 'couchbase';

interface StoreOptions {
  cas?: string;
  transcoder?: any;
  timeout?: number;
  maxExpiry?: number;
  expiry?: number;
  transactionContext?: TransactionAttemptContext;
}

/**
 *  Stores a Document: Updates a document if CAS value is defined, otherwise it inserts a new document.
 *  CAS is a value representing the current state of an item/document in the Couchbase Server. Each modification of the document changes it's CAS value.
 */
export const store = async (key, data, options: StoreOptions, collection): Promise<any> => {
  let storePromise;
  const { transactionContext } = options || {};
  if (options.maxExpiry !== undefined) {
    options.expiry = options.maxExpiry;
    delete options.maxExpiry;
  }
  if (options.cas) {
    if (transactionContext) {
      const doc = await transactionContext.get(collection, key);
      storePromise = transactionContext.replace(doc, data);
    } else {
      storePromise = collection.replace(key, data, options);
    }
  } else {
    if (options.transactionContext) {
      storePromise = options.transactionContext.insert(collection, key, data);
    } else {
      storePromise = collection.insert(key, data, options);
    }
  }
  return storePromise;
};
