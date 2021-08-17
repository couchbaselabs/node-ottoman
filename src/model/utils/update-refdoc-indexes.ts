import { isDebugMode } from '../../utils/is-debug-mode';

export const updateRefdocIndexes = async (
  refKeys: { add: string[]; remove: string[] },
  key: string | null,
  collection,
) => {
  for await (const ref of addRefKeys(refKeys.add, collection, key)) {
    if (isDebugMode()) {
      console.log('Adding refdoc index:', ref);
    }
  }

  for await (const ref of removeRefKeys(refKeys.remove, collection)) {
    if (isDebugMode()) {
      console.log('Removing refdoc index:', ref);
    }
  }
};

async function* addRefKeys(refKeys, collection, key) {
  for (const ref of refKeys) {
    if (ref.length < 250) {
      yield collection.insert(ref, key).catch((e) => {
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

async function* removeRefKeys(refKeys, collection) {
  for (const ref of refKeys) {
    yield collection.remove(ref).catch((e) => {
      if (isDebugMode()) {
        console.warn(e);
      }
    });
  }
}
