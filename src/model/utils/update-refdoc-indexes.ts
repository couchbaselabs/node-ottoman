export const updateRefdocIndexes = (refKeys: { add: string[]; remove: string[] }, key: string | null, collection) => {
  for (const ref of refKeys.add) {
    try {
      collection.insert(ref, key);
    } catch (e) {
      console.log(e);
    }
  }

  for (const ref of refKeys.remove) {
    try {
      collection.insert(ref, key);
    } catch (e) {
      collection.remove(ref);
    }
  }
};
