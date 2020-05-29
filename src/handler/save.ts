import { __conn } from '../connections/connection-handler';

/**
 * Save document
 */
export const save = (key: string, data, collection?): Promise<any> => {
  return (collection ? collection : __conn.getCollection()).upsert(key, data);
};
