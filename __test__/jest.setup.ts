import { Ottoman, close } from '../src';
import { connectUri } from './testData';

beforeEach(async () => {
  let options = { collectionName: '_default' };
  if (process.env.OTTOMAN_LEGACY_TEST) {
    options = { collectionName: '_default' };
  }
  const ottoman = new Ottoman(options);
  ottoman.connect(connectUri);
});

afterEach(async () => {
  close();
});
