export const bucketName = 'travel-sample';
export const username = 'Administrator';
export const password = 'password';
export const connectionString = 'couchbase://localhost';
export const connectUri = `${connectionString}/${bucketName}@${username}:${password}`;

export const delay = (timems) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timems);
  });

export const startInTest = async (conn, params = {}) => {
  const useCollections = !!process.env.useCollections;
  await conn.start({ useCollections, ...params });
  await delay(700);
  return true;
};
