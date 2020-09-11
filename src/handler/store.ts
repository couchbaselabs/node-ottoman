interface StoreOptions {
  cas?: string;
  transcoder?: any;
  timeout?: number;
}

/**
 *  Store a Document
 *  if cas value is defined then the document is updated, otherwise it is inserted.
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
