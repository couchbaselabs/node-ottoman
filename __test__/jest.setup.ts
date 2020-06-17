import { closeConnection, connect, globalConfig } from '../lib';
import { connectUri } from './testData';
beforeAll(async () => {
  globalConfig({
    collectionKey: 'ottomanCollectionType',
    scopeKey: 'ottomanScopeType',
    populateMaxDeep: 1,
  });
  connect(connectUri);
});

afterAll(async () => {
  closeConnection();
});
