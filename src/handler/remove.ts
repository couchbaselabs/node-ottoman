interface RemoveOptions {
  timeout?: number;
}

/**
 * Remove element a document by id from the given collection
 */
export const remove = (id, collection, options?: RemoveOptions): Promise<any> => {
  return collection.remove(id, options);
};
