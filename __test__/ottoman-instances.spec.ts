import { getModelMetadata, Ottoman } from '../src';
import { connectionString, username, connectUri, bucketName, password } from './testData';
import { isModel } from '../src/utils/is-model';
import { OttomanError } from '../src/exceptions/ottoman-errors';

describe('Test ottoman instances', () => {
  test('Multiple instances with string param', async () => {
    const instance2 = new Ottoman();
    await instance2.connect(connectUri);
    expect(instance2.bucket).toBeDefined();
    await instance2.close();
  });

  test('Multiple instances with object param', async () => {
    const instance3 = new Ottoman();
    await instance3.connect({
      bucketName,
      password,
      connectionString,
      username,
    });
    expect(instance3.bucket).toBeDefined();
    instance3.model('Dog', { name: String });
    const ModelDog = instance3.getModel('Dog');
    await instance3.close();
    expect(isModel(ModelDog)).toBe(true);
  });

  test('Get default collection', async () => {
    const instance = new Ottoman();
    await instance.connect(connectUri);
    const defaultCollection = instance.getCollection();
    expect(defaultCollection.name).toBe('');
    await instance.close();
  });

  test('Get collection by name', async () => {
    const instance = new Ottoman();
    await instance.connect(connectUri);
    const collectionName = 'test';
    const testCollection = instance.getCollection(collectionName);
    expect(testCollection.name).toBe(collectionName);
    await instance.close();
  });

  test('Get cluster -> throw error', () => {
    const instance = new Ottoman();
    try {
      instance.cluster;
    } catch (e) {
      const { message } = e;
      expect(e).toBeInstanceOf(OttomanError);
      expect(message).toBe('No active connection detected, please try to connect.');
    }
  });

  test('model -> throw error already been registered', () => {
    const instance = new Ottoman();
    instance.model('User', { name: String });

    try {
      instance.model('User', { lastname: String });
    } catch (e) {
      const { message } = e;
      expect(e).toBeInstanceOf(OttomanError);
      expect(message).toBe(`A model with name 'User' has already been registered.`);
    }
  });

  test('Change idKey at global level', async () => {
    const idKey = '_id';
    const instance = new Ottoman({ idKey });
    await instance.connect({
      bucketName,
      password,
      connectionString,
      username,
    });
    expect(instance.bucket).toBeDefined();
    instance.model('Dog', { name: String });
    const ModelDog = instance.getModel('Dog');
    const metadata = getModelMetadata(ModelDog);
    expect(metadata.ID_KEY).toBe(idKey);
    await instance.close();
    expect(isModel(ModelDog)).toBe(true);
  });
});
