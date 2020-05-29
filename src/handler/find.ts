import { __conn } from '../connections/connection-handler';

/**
 * Find documents
 * @ignore
 */
export function find(params, collection?) {
  return (collection ? collection : __conn.getCollection()).get(params);
}
