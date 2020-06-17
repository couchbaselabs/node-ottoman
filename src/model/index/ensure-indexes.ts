import { ConnectionManager } from '../../connections/connection-manager';
import { getDefaultConnection } from '../../connections/connection-handler';
import { ensureViewIndexes } from './view/ensure-view-indexes';
import { ensureN1qlIndexes } from './n1ql/ensure-n1ql-indexes';

/**
 * Ensure all indexes are create on DB Server
 */
export const ensureIndexes = async (connection?: ConnectionManager) => {
  const currentConnection = connection || getDefaultConnection();
  await ensureViewIndexes(currentConnection);
  await ensureN1qlIndexes(currentConnection);
};
