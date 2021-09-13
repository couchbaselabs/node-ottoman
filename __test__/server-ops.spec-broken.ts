import {
  getDefaultInstance,
  ScopeNotFoundError,
  CouchbaseError,
  BucketNotFoundError,
  CollectionNotFoundError,
} from '../src';
import { DEFAULT_SCOPE } from '../src/utils/constants';
import { parseError } from '../src/utils/parse-errors';

test('create and drop Collection', async () => {
  if (process.env.OTTOMAN_LEGACY_TEST) {
    expect(1).toBe(1);
  } else {
    const ottoman = getDefaultInstance();
    const name = `testCreateCollection-${Date.now()}`;
    const collectionCreated = await ottoman.collectionManager.createCollection({
      name,
      scopeName: DEFAULT_SCOPE,
      maxExpiry: 30000,
    });
    expect(collectionCreated).toBe(undefined);

    const collectionDropped = await ottoman.collectionManager.dropCollection(name, DEFAULT_SCOPE);
    expect(collectionDropped).toBe(undefined);
  }
});

test('create and drop Scope with Collections', async () => {
  if (process.env.OTTOMAN_LEGACY_TEST) {
    expect(1).toBe(1);
  } else {
    const ottoman = getDefaultInstance();
    const name = `collectionOnCreatedScope-${Date.now()}`;
    const scopeName = `testCreateScope6-${Date.now()}`;

    const scopeCreated = await ottoman.collectionManager.createScope(scopeName);
    expect(scopeCreated).toBe(undefined);

    const collectionCreated = await ottoman.collectionManager.createCollection({
      name,
      scopeName,
      maxExpiry: 30000,
    });
    expect(collectionCreated).toBe(undefined);

    const scopeDropped = await ottoman.collectionManager.dropScope(scopeName);
    expect(scopeDropped).toBe(undefined);
  }
});

describe('Ottoman.dropScope', () => {
  test(`-> should throw ScopeNotFoundError`, async () => {
    const ottoman = getDefaultInstance();
    try {
      if (process.env.OTTOMAN_LEGACY_TEST) {
        const error = new ScopeNotFoundError(new Error(''));
        error.message = 'failed to drop scope';
        parseError(error, { scopeName: 'DummyScopeTestError' });
      } else await ottoman.dropScope('DummyScopeTestError');
    } catch (e) {
      expect(e).toBeInstanceOf(ScopeNotFoundError);
      expect(e.cause.message.endsWith(`scope 'DummyScopeTestError' not found`)).toBe(true);
    }
  });
  test(`-> on legacy should throw CouchbaseError`, async () => {
    const ottoman = getDefaultInstance();
    try {
      await ottoman.dropScope('DummyScopeTestError');
    } catch (e) {
      expect(e).toBeInstanceOf(CouchbaseError);
    }
  });
});

describe('Ottoman.dropCollection', () => {
  test(`-> should throw CollectionNotFoundError`, async () => {
    const ottoman = getDefaultInstance();
    try {
      if (process.env.OTTOMAN_LEGACY_TEST) {
        const error = new CollectionNotFoundError(new Error('failed to drop collection'));
        parseError(error, { collectionName: 'DummyCollectionTestError', scopeName: DEFAULT_SCOPE });
      } else await ottoman.dropCollection('DummyCollectionTestError', DEFAULT_SCOPE);
    } catch (e) {
      expect(e).toBeInstanceOf(CollectionNotFoundError);
      expect(e.cause.message.endsWith(`in scope '_default' collection 'DummyCollectionTestError' not found`)).toBe(
        true,
      );
    }
  });
  test(`-> should throw ScopeNotFoundError`, async () => {
    const ottoman = getDefaultInstance();
    try {
      if (process.env.OTTOMAN_LEGACY_TEST) {
        const error = new ScopeNotFoundError(new Error(''));
        error.message = 'failed to drop collection';
        parseError(error, { collectionName: 'DummyCollectionTestError', scopeName: 'DummyScopeTestError' });
      } else await ottoman.dropCollection('DummyCollectionTestError', 'DummyScopeTestError');
    } catch (e) {
      const { message } = e;
      expect(e).toBeInstanceOf(ScopeNotFoundError);
      expect(
        e.cause.message.endsWith(`collection 'DummyCollectionTestError', scope 'DummyScopeTestError' not found`),
      ).toBe(true);
    }
  });
  test(`-> on legacy should throw CouchbaseError`, async () => {
    const ottoman = getDefaultInstance();
    try {
      await ottoman.dropCollection('DummyCollectionTestError', 'DummyScopeTestError');
    } catch (e) {
      expect(e).toBeInstanceOf(CouchbaseError);
    }
  });
});

describe('Ottoman.dropBucket', () => {
  test(`-> should throw BucketNotFoundError`, async () => {
    const ottoman = getDefaultInstance();
    try {
      await ottoman.dropBucket('DummyBucketTestError');
    } catch (e) {
      expect(e).toBeInstanceOf(BucketNotFoundError);
      expect(e.cause.message.endsWith(`bucket 'DummyBucketTestError' not found`)).toBe(true);
    }
  });
});
