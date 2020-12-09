import couchbase from 'couchbase';
import { Ottoman } from '../../../ottoman/ottoman';

export const ensureViewIndexes = async (ottoman: Ottoman, indexes) => {
  const ddocs: { name: string; data: any }[] = [];
  for (const key in indexes) {
    if (indexes.hasOwnProperty(key)) {
      ddocs.push({
        name: key,
        data: indexes[key],
      });
    }
  }

  if (ddocs.length === 0) {
    return;
  }

  for (const ddoc of ddocs) {
    const doc = (couchbase as any).DesignDocument._fromData(ddoc.name, ddoc.data);
    await ottoman.viewIndexManager.upsertDesignDocument(doc);
  }
  return true;
};
