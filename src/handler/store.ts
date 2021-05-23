interface StoreOptions {
  cas?: string;
  transcoder?: any;
  timeout?: number;
}

/**
 *  Stores a Document: Updates a document if CAS value is defined, otherwise it inserts a new document.
 *  CAS is a value representing the current state of an item/document in the Couchbase Server. Each modification of the document changes it's CAS value.
 */
export const store = (key, data, options: StoreOptions, collection): Promise<any> => {
  let storePromise;
  if (options.cas) {
    storePromise = collection.replace(key, data, options);
  } else {
    storePromise = collection.insert(key, data, options);
  }
  return storePromise;
};
