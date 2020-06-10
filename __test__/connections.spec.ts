import { connect } from '../lib';
import { connectionString, username, connectUri, bucketName, password } from './testData';
import { isModel } from '../lib/utils/is-model';

describe('Test connections', () => {
  test('Multiples connections with string param', () => {
    const conn2 = connect(connectUri);
    expect(conn2.bucket).toBeDefined();
    conn2.close();
  });

  test('Multiples connections with object param and get model from other connection', () => {
    const conn3 = connect({
      bucketName,
      password,
      connectionString,
      username,
    });
    expect(conn3.bucket).toBeDefined();

    conn3.model('Dog', { name: String });
    const ModelDog = conn3.getModel('Dog');
    expect(isModel(ModelDog)).toBe(true);
    conn3.close();
  });

  test('Get default collection', () => {
    const conn2 = connect(connectUri);
    const defaultCollection = conn2.getCollection();
    expect(defaultCollection._name).toBe('');
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
