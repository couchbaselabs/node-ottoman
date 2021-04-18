import { BucketNotFoundError, CollectionNotFoundError, CouchbaseError, ScopeNotFoundError } from 'couchbase';
import { getDefaultInstance } from '../src';
import { DEFAULT_SCOPE } from '../src/utils/constants';
import { parseError } from '../src/utils/parse-errors';
import { delay } from './testData';

test('create and drop Collection', async () => {
  if (process.env.OTTOMAN_LEGACY_TEST) {
    expect(1).toBe(1);
  } else {
    const ottoman = getDefaultInstance();
    const name = 'testCreateCollection';
    const collectionCreated = await ottoman.collectionManager.createCollection({
      name,
      scopeName: DEFAULT_SCOPE,
      maxExpiry: 30000,
    });
    expect(collectionCreated).toBe(undefined);

    await delay(3000);

    const collectionDropped = await ottoman.collectionManager.dropCollection(name, DEFAULT_SCOPE);
    expect(collectionDropped).toBe(undefined);
  }
});

test('create and drop Scope with Collections', async () => {
  if (process.env.OTTOMAN_LEGACY_TEST) {
    expect(1).toBe(1);
  } else {
    const ottoman = getDefaultInstance();
    const name = 'collectionOnCreatedScope';
    const scopeName = 'testCreateScope6';

    const scopeCreated = await ottoman.collectionManager.createScope(scopeName);
    await delay(500);

    const collectionCreated = await ottoman.collectionManager.createCollection({
      name,
      scopeName,
      maxExpiry: 30000,
    });
    await delay(500);

    const scopeDropped = await ottoman.collectionManager.dropScope(scopeName);

    expect(scopeCreated).toBe(undefined);
    expect(scopeDropped).toBe(undefined);
    expect(collectionCreated).toBe(undefined);
  }
});

describe('Ottoman.dropScope', () => {
  test(`-> should throw ScopeNotFoundError`, async () => {
    const ottoman = getDefaultInstance();
    try {
      if (process.env.OTTOMAN_LEGACY_TEST) {
        const error = new ScopeNotFoundError();
        error.message = 'failed to drop scope';
        parseError(error, { scopeName: 'DummyScopeTestError' });
      } else await ottoman.dropScope('DummyScopeTestError');
    } catch (e) {
      const { message } = e;
      expect(e).toBeInstanceOf(ScopeNotFoundError);
      expect(message).toBe(`failed to drop scope, scope 'DummyScopeTestError' not found`);
    }
  });
});

describe('Ottoman.dropCollection', () => {
  test(`-> should throw CollectionNotFoundError`, async () => {
    const ottoman = getDefaultInstance();
    try {
      if (process.env.OTTOMAN_LEGACY_TEST) {
        const error = new CollectionNotFoundError();
        error.message = 'failed to drop collection';
        parseError(error, { collectionName: 'DummyCollectionTestError', scopeName: DEFAULT_SCOPE });
      } else await ottoman.dropCollection('DummyCollectionTestError', DEFAULT_SCOPE);
    } catch (e) {
      const { message } = e;
      expect(e).toBeInstanceOf(CollectionNotFoundError);
      expect(message).toBe(
        `failed to drop collection, in scope '_default' collection 'DummyCollectionTestError' not found`,
      );
    }
  });
  test(`-> should throw ScopeNotFoundError`, async () => {
    const ottoman = getDefaultInstance();
    try {
      if (process.env.OTTOMAN_LEGACY_TEST) {
        const error = new CouchbaseError('failed to drop collection', undefined, {
          response_body: 'scope_not_found',
        });
        parseError(error, { collectionName: 'DummyCollectionTestError', scopeName: 'DummyScopeTestError' });
      } else await ottoman.dropCollection('DummyCollectionTestError', 'DummyScopeTestError');
    } catch (e) {
      const { message } = e;
      expect(e).toBeInstanceOf(CouchbaseError);
      expect(message).toBe(
        `failed to drop collection 'DummyCollectionTestError', scope 'DummyScopeTestError' not found`,
      );
    }
  });
});

describe('Ottoman.dropBucket', () => {
  test(`-> should throw BucketNotFoundError`, async () => {
    const ottoman = getDefaultInstance();
    try {
      await ottoman.dropBucket('DummyBucketTestError');
    } catch (e) {
      const { message } = e;
      expect(e).toBeInstanceOf(BucketNotFoundError);
      expect(message).toBe(`failed to drop bucket, bucket 'DummyBucketTestError' not found`);
    }
  });
});
