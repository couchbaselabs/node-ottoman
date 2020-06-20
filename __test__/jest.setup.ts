import { closeConnection, connect, globalConfig, ensureIndexes } from '../lib';
import { connectUri } from './testData';
beforeAll(async () => {
  globalConfig({
    collectionKey: 'ottomanCollectionType',
    scopeKey: 'ottomanScopeType',
    populateMaxDeep: 1,
  });
  connect(connectUri);
  await ensureIndexes();
});

afterAll(async () => {
  closeConnection();
});
