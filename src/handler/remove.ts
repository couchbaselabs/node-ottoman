interface RemoveOptions {
  timeout?: number;
}

/**
 * Removes a document by id from a given collection.
 */
export const remove = (id, collection, options?: RemoveOptions): Promise<any> => {
  return collection.remove(id, options);
};
