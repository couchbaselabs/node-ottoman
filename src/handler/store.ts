interface StoreOptions {
  cas?: string;
  transcoder?: any;
  timeout?: number;
}

/**
 *  Store a Document
 *  if cas value is defined then the document is updated, otherwise it is inserted.
 */
export const store = (key, data, options: StoreOptions, collection, ID_KEY): Promise<any> => {
  let storePromise;
  delete data.id;
  if (options.cas) {
    storePromise = collection.replace(key, data, options);
  } else {
    storePromise = collection.insert(key, data, options);
  }
  return storePromise.then((result) => {
    result[ID_KEY] = key;
    return result;
  });
};
