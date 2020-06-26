export const updateRefdocIndexes = (refKeys: { add: string[]; remove: string[] }, key: string | null, collection) => {
  for (const ref of refKeys.add) {
    if (ref.length < 250) {
      collection.insert(ref, key).catch((e) => console.warn(e));
    } else {
      console.log(`Unable to store refdoc index for ${ref}, Maximum key size is 250 bytes`);
    }
  }

  for (const ref of refKeys.remove) {
    collection.remove(ref).catch((e) => console.warn(e));
  }
};
