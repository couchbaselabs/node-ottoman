import couchbase from 'couchbase';
import { Ottoman } from '../../../ottoman/ottoman';

export const ensureViewIndexes = async (ottoman: Ottoman, indexes) => {
  const designDocs: { name: string; data: any }[] = [];
  for (const key in indexes) {
    if (indexes.hasOwnProperty(key)) {
      designDocs.push({
        name: key,
        data: indexes[key],
      });
    }
  }

  if (designDocs.length === 0) {
    return;
  }

  for (const designDoc of designDocs) {
    const doc = (couchbase as any).DesignDocument._fromData(designDoc.name, designDoc.data);
    await ottoman.viewIndexManager.upsertDesignDocument(doc);
  }
  return true;
};
