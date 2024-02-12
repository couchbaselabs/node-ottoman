import { TransactionAttemptContext } from 'couchbase';

interface RemoveOptions {
  timeout?: number;
  transactionContext?: TransactionAttemptContext;
}

/**
 * Removes a document by id from a given collection.
 */
export const remove = async (id, collection, options?: RemoveOptions): Promise<any> => {
  const { transactionContext } = options || {};
  if (transactionContext) {
    const doc = await transactionContext.get(collection, id);
    return transactionContext.remove(doc);
  }
  return collection.remove(id, options);
};
