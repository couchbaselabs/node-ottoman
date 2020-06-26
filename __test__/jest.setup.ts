import { connect, globalConfig, getConnections } from '../lib';
import { connectUri } from './testData';
beforeAll(async () => {
  globalConfig({
    collectionKey: '__type',
    scopeKey: '__scope',
    populateMaxDeep: 1,
  });
  connect(connectUri);
});

afterAll(async () => {
  const connections = getConnections() || [];
  for (const connection of connections) {
    await connection.close();
  }
});
