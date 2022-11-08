import { Ottoman, SearchConsistency } from '../src';

export const bucketName = 'travel-sample';
export const username = 'Administrator';
export const password = 'password';
export const connectionString = 'couchbase://192.168.0.107';
export const connectUri = `${connectionString}/${bucketName}@${username}:${password}`;

export const delay = (timems: number): Promise<boolean> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timems);
  });

export const startInTest = async (ottoman: Ottoman): Promise<boolean> => {
  await ottoman.start();
  return true;
};

export const consistency = { consistency: SearchConsistency.LOCAL };
