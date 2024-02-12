import { LogicalWhereExpr, Ottoman, SearchConsistency, FindOptions, ModelTypes } from '../src';

export const bucketName = 'travel-sample';
export const username = 'Administrator';
export const password = 'password';
export const connectionString = 'couchbase://127.0.0.1';
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

export const cleanUp = <T = any>(
  model: ModelTypes<T>,
  query: LogicalWhereExpr<T> = { _type: model.collectionName },
  options: FindOptions = { consistency: SearchConsistency.LOCAL },
) => {
  return model.removeMany(query, options);
};

export const consistency = { consistency: SearchConsistency.LOCAL };
