import { connect, model } from '../src';
import { connectionString, username, connectUri, bucketName, password } from './testData';
import { isModel } from '../src/utils/is-model';

describe('Test connections', () => {
  process.env.OTTOMAN_CONNECTION_STRING = connectUri;
  const User = model('User', { name: String });
  expect(User).toBeDefined();

  test('Multiple connections with string param', () => {
    const conn2 = connect(connectUri);
    expect(conn2.bucket).toBeDefined();
    conn2.close();
  });

  test('Multiple connections with object param', () => {
    const conn3 = connect({
      bucketName,
      password,
      connectionString,
      username,
    });
    expect(conn3.bucket).toBeDefined();
    conn3.model('Dog', { name: String });
    const ModelDog = conn3.getModel('Dog');
    conn3.close();
    expect(isModel(ModelDog)).toBe(true);
  });

  test('Get default collection', () => {
    const conn2 = connect(connectUri);
    const defaultCollection = conn2.getCollection();
    expect(defaultCollection._name).toBe('_default');
    conn2.close();
  });

  test('Get collection by name', () => {
    const conn2 = connect(connectUri);
    const collectionName = 'test';
    const testCollection = conn2.getCollection(collectionName);
    expect(testCollection._name).toBe(collectionName);
    conn2.close();
  });
});
