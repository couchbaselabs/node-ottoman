import { bucketName, connectionString, connectUri, password, username } from './testData';
import { model } from '../lib';
import {isModel} from "../lib/utils/is-model";
import { extractConnectionString } from '../lib/utils/extract-connection-string';

test('Build connection options from string', () => {
  const result = extractConnectionString(connectUri);
  expect(result.password).toEqual(password);
  expect(result.username).toEqual(username);
  expect(result.connectionString).toEqual(connectionString);
  expect(result.bucketName).toEqual(bucketName);
});

describe('isModel util function', () => {
  test('isModel to be true', async () => {
    const UserModel = model('User', {name: String});
    const user = new UserModel();
    expect(isModel(user)).toBe(true);
  });
  
  test('isModel to be false', async () => {
    class Person {}
    const jane = new Person();
    expect(isModel(jane)).toBe(false);
  });
  
  test('isModel to be false', async () => {
    expect(isModel()).toBe(false);
  });
})

