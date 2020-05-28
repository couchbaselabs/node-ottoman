import { ConnectOptions } from '../adapter/adapter';

export const extractConnectionString = (connectOptions: string): ConnectOptions => {
  const [connUrl, credentials] = connectOptions.split('@');
  const [username, password] = credentials.split(':');
  const lastIndex = connUrl.lastIndexOf('/');
  const connectionString = connUrl.substring(0, lastIndex);
  const bucketName = connUrl.substring(lastIndex + 1);
  return { connectionString, username, password, bucketName };
};
