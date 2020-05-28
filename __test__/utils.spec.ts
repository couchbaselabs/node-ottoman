import { bucketName, connectionString, connectUri, password, username } from './testData';
import { extractConnectionString } from '../lib/utils/extract-connection-string';

test('Build connection options from string', () => {
  const result = extractConnectionString(connectUri);
  expect(result.password).toEqual(password);
  expect(result.username).toEqual(username);
  expect(result.connectionString).toEqual(connectionString);
  expect(result.bucketName).toEqual(bucketName);
});
