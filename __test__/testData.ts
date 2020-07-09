export const bucketName = 'travel-sample';
export const username = 'admin';
export const password = 'password';
export const connectionString = 'couchbase://localhost';
export const connectUri = `${connectionString}/${bucketName}@${username}:${password}`;

export const delay = (timems) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timems);
  });
