import { bucketName, connectionString, connectUri, password, username } from './testData';
import { model } from '../src';
import { isModel } from '../src/utils/is-model';
import { extractConnectionString } from '../src/utils/extract-connection-string';
import { is } from '../src/utils/is-type';
import { isMetadataKey } from '../src/utils/is-metadata';
import { MODEL_KEY } from '../src/utils/constants';
import { canBePopulated } from '../src/utils/populate/can-be-populated';

test('Build connection options from string', () => {
  const result = extractConnectionString(connectUri);
  expect(result.password).toEqual(password);
  expect(result.username).toEqual(username);
  expect(result.connectionString).toEqual(connectionString);
  expect(result.bucketName).toEqual(bucketName);
});

describe('isModel util function', () => {
  test('isModel to be true', async () => {
    const UserModel = model('User', { name: String });
    const user = new UserModel({});
    expect(isModel(user)).toBe(true);
  });

  test('isModel to be false', async () => {
    class Person {}
    const jane = new Person();
    expect(isModel(jane)).toBe(false);
  });

  test('isModel to be false', async () => {
    // @ts-ignore
    expect(isModel()).toBe(false);
  });
});

describe('Is operator', () => {
  test('should return true when the value is type', () => {
    /// String type
    expect(is('val', String)).toBeTruthy();
    expect(is(new String(''), String)).toBeTruthy();
    /// Boolean type
    expect(is(true, Boolean)).toBeTruthy();
    expect(is(false, Boolean)).toBeTruthy();
    /// Number type
    expect(is(23, Number)).toBeTruthy();
    expect(is(0.23, Number)).toBeTruthy();
  });

  test("should return false when the value isn't type", () => {
    /// String type
    expect(is(true, String)).toBeFalsy();
    expect(is(0.23, String)).toBeFalsy();

    /// Boolean type
    expect(is('val', Boolean)).toBeFalsy();
    expect(is(23, Boolean)).toBeFalsy();

    /// Number type
    expect(is(false, Number)).toBeFalsy();
    expect(is(new String(''), Number)).toBeFalsy();
  });

  test('should return false when the value is undefined or null', () => {
    /// String type
    expect(is(undefined, String)).toBeFalsy();
    expect(is(null, String)).toBeFalsy();

    /// Boolean type
    expect(is(undefined, Boolean)).toBeFalsy();
    expect(is(null, Boolean)).toBeFalsy();

    /// Number type
    expect(is(undefined, Number)).toBeFalsy();
    expect(is(null, Number)).toBeFalsy();
  });
});

describe('Metadata', () => {
  test('should return true when a key is a metadata key', () => {
    expect(isMetadataKey('id')).toBeTruthy();
    expect(isMetadataKey(MODEL_KEY)).toBeTruthy();
  });
  test("should return false when a key isn't a metadata key", () => {
    expect(isMetadataKey('name')).toBeFalsy();
  });
});

test('util.canBePopulated', async () => {
  expect(canBePopulated('name', ['name', 'email'])).toBe(true);
  expect(canBePopulated('age', ['name', 'email'])).toBe(false);
});
