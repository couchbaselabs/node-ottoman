import { getDefaultInstance } from '../src';
import { DEFAULT_SCOPE } from '../src/utils/constants';
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
    expect(collectionCreated).toBe(true);

    await delay(3000);

    const collectionDroped = await ottoman.collectionManager.dropCollection(name, DEFAULT_SCOPE);
    expect(collectionDroped).toBe(true);
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
    expect(scopeCreated).toBe(true);

    await delay(3000);

    const collectionCreated = await ottoman.collectionManager.createCollection({
      name,
      scopeName,
      maxExpiry: 30000,
    });
    expect(collectionCreated).toBe(true);

    await delay(3000);

    const scopeDroped = await ottoman.collectionManager.dropScope(scopeName);
    expect(scopeDroped).toBe(true);
  }
});
