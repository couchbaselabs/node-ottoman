import { Ottoman } from '../src';
import { connectionString, username, connectUri, bucketName, password } from './testData';
import { isModel } from '../src/utils/is-model';

describe('Test ottoman instances', () => {
  test('Multiple instances with string param', () => {
    const instance2 = new Ottoman();
    instance2.connect(connectUri);
    expect(instance2.bucket).toBeDefined();
    instance2.close();
  });

  test('Multiple instances with object param', () => {
    const instance3 = new Ottoman();
    instance3.connect({
      bucketName,
      password,
      connectionString,
      username,
    });
    expect(instance3.bucket).toBeDefined();
    instance3.model('Dog', { name: String });
    const ModelDog = instance3.getModel('Dog');
    instance3.close();
    expect(isModel(ModelDog)).toBe(true);
  });

  test('Get default collection', () => {
    const instance = new Ottoman();
    instance.connect(connectUri);
    const defaultCollection = instance.getCollection();
    expect(defaultCollection._name).toBe('_default');
    instance.close();
  });

  test('Get collection by name', () => {
    const instance = new Ottoman();
    instance.connect(connectUri);
    const collectionName = 'test';
    const testCollection = instance.getCollection(collectionName);
    expect(testCollection._name).toBe(collectionName);
    instance.close();
  });
});
