import { Ottoman } from '../src';

export const bucketName = 'travel-sample';
export const username = 'Administrator';
export const password = 'password';
export const connectionString = 'couchbase://127.0.0.1';
export const connectUri = `${connectionString}/${bucketName}@${username}:${password}`;

export const delay = (timems) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timems);
  });

export const startInTest = async (ottoman: Ottoman) => {
  await ottoman.start();
  await delay(700);
  return true;
};
