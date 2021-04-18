import { getModelMetadata, Ottoman } from '../src';
import { OttomanError } from '../src/exceptions/ottoman-errors';
import { isModel } from '../src/utils/is-model';
import { bucketName, connectionString, connectUri, password, username } from './testData';

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
    expect(defaultCollection.name).toBe('');
    instance.close();
  });

  test('Get collection by name', () => {
    const instance = new Ottoman();
    instance.connect(connectUri);
    const collectionName = 'test';
    const testCollection = instance.getCollection(collectionName);
    expect(testCollection.name).toBe(collectionName);
    instance.close();
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

  test('Change idKey at global level', () => {
    const idKey = '_id';
    const instance = new Ottoman({ idKey });
    instance.connect({
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
    instance.close();
    expect(isModel(ModelDog)).toBe(true);
  });
});
