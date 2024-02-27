import { isDebugMode } from '../../utils/is-debug-mode';
import { Collection, TransactionAttemptContext } from 'couchbase';
import { TransactionGetResult, MutationResult } from 'couchbase';

export const updateRefdocIndexes = async (
  refKeys: { add: string[]; remove: string[] },
  key: string | null,
  collection: Collection,
  transactionContext?: TransactionAttemptContext,
) => {
  for await (const ref of addRefKeys(refKeys.add, collection, key, transactionContext)) {
    if (isDebugMode()) {
      console.log('Adding refdoc index:', ref);
    }
  }

  for await (const ref of removeRefKeys(refKeys.remove, collection, transactionContext)) {
    if (isDebugMode()) {
      console.log('Removing refdoc index:', ref);
    }
  }
};

async function* addRefKeys(refKeys, collection, key, transactionContext?: TransactionAttemptContext) {
  for (const ref of refKeys) {
    if (ref.length < 250) {
      let promise: Promise<TransactionGetResult | MutationResult>;
      if (transactionContext) {
        promise = transactionContext.insert(collection, ref, key);
      } else {
        promise = collection.insert(ref, key);
      }
      yield promise.catch((e) => {
        if (isDebugMode()) {
          console.warn(e);
        }
      });
    } else {
      console.log(`Unable to store refdoc index for ${ref}, Maximum key size is 250 bytes`);
      yield false;
    }
  }
}

async function* removeRefKeys(refKeys, collection, transactionContext?: TransactionAttemptContext) {
  for (const ref of refKeys) {
    let promise: Promise<void>;
    if (transactionContext) {
      const doc = await transactionContext.get(collection, ref);
      promise = transactionContext.remove(doc);
    } else {
      promise = collection.remove(ref);
    }
    yield promise.catch((e) => {
      if (isDebugMode()) {
        console.warn(e);
      }
    });
  }
}
