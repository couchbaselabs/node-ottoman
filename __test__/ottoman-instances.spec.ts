import { Ottoman } from '../src';
import { connectionString, username, connectUri, bucketName, password } from './testData';
import { isModel } from '../src/utils/is-model';
import { OttomanError } from '../src/exceptions/ottoman-errors';

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
    expect(defaultCollection._name).toBe('');
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
});
