import { Ottoman, getDefaultInstance } from '../src';
import { password, username, connectionString, bucketName } from './testData';

beforeEach(async () => {
  let options = {};
  if (process.env.OTTOMAN_LEGACY_TEST) {
    options = { collectionName: '_default' };
  }
  const ottoman = new Ottoman(options);
  ottoman.connect({
    password,
    username,
    connectionString,
    bucketName,
  });
});

afterEach(async () => {
  await getDefaultInstance()?.close();
});
