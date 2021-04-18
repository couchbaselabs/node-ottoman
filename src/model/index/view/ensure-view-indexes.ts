import { DesignDocument } from 'couchbase';
import { Ottoman } from '../../../ottoman/ottoman';

export const ensureViewIndexes = async (ottoman: Ottoman, indexes): Promise<boolean | undefined> => {
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
    const doc = DesignDocument._fromNsData(designDoc.name, designDoc.data);
    await ottoman.viewIndexManager.upsertDesignDocument(doc);
  }
  return true;
};
