import { closeConnection, connect } from '../lib/index';
import { connectUri } from './testData';
beforeAll(async () => {
  connect(connectUri);
});

afterAll(async () => {
  closeConnection();
});
