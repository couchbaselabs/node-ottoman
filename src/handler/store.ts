interface StoreOptions {
  cas?: string;
  transcoder?: any;
  timeout?: number;
}

/**
 *  Store a Document
 *  if cas value is defined document is updated, else it's inserted,
 */
export const store = (data, options: StoreOptions, collection, ID_KEY): Promise<any> => {
  let storePromise;
  if (options.cas) {
    storePromise = collection.replace(data[ID_KEY], data, options);
  } else {
    storePromise = collection.insert(data[ID_KEY], data, options);
  }
  return storePromise.then((result) => {
    result[ID_KEY] = data[ID_KEY];
    return result;
  });
};
