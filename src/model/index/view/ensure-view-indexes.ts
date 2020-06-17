import { getViewIndexes } from '../index-manager';
import couchbase from 'couchbase';
import { ConnectionManager } from '../../../connections/connection-manager';

export const ensureViewIndexes = async (connection: ConnectionManager) => {
  const ddocs: { name: string; data: any }[] = [];
  const indexes = getViewIndexes();
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
    const doc = couchbase.DesignDocument._fromData(ddoc.name, ddoc.data);
    await connection.viewIndexManager.upsertDesignDocument(doc);
  }
  return true;
};
