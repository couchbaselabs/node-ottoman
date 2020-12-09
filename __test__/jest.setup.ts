import { Ottoman, close } from '../src';
import { connectUri } from './testData';
beforeAll(async () => {
  let options = {};
  if (process.env.OTTOMAN_LEGACY_TEST) {
    options = { collectionName: '_default' };
  }
  const ottoman = new Ottoman(options);
  ottoman.connect(connectUri);
});

afterAll(async () => {
  close();
});
