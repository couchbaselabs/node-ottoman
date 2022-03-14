import { getDefaultInstance, model, ModelTypes, Ottoman, Schema } from '../src';
import { DurabilityLevel, BucketType, CompressionMode, EvictionPolicy, ConflictResolutionType } from 'couchbase';
import { connectionString, password, username, delay, consistency } from './testData';

const connOptions = { connectionString, username, password, bucketName: 'testBucket' };

const UserSchema = new Schema(
  {
    userid: { type: String, required: true },
    firstName: String,
    lastName: String,
    username: String,
    street: String,
    city: String,
    state: String,
    zipCode: Number,
    name: String,
    phone: String,
    email: String,
  },
  {
    timestamps: true,
  },
);

model('UserProfile', UserSchema, {
  idKey: 'userid',
  collectionName: 'UserProfileCollectionTest',
  scopeName: 'UserProfileScopeTest',
});

describe('Testing ensure collections and indexes', () => {
  test('Create a new bucket', async () => {
    const otto = getDefaultInstance();

    await otto.cluster.buckets().createBucket({
      conflictResolutionType: ConflictResolutionType.SequenceNumber,
      storageBackend: 'couchstore',
      ejectionMethod: EvictionPolicy.ValueOnly,
      name: 'testBucket',
      flushEnabled: false,
      ramQuotaMB: 200,
      numReplicas: 1,
      replicaIndexes: false,
      bucketType: BucketType.Couchbase,
      evictionPolicy: EvictionPolicy.ValueOnly,
      maxExpiry: 0,
      compressionMode: CompressionMode.Passive,
      minimumDurabilityLevel: DurabilityLevel.None,
      maxTTL: 0,
      durabilityMinLevel: 'none',
    });
    await delay(2500);

    const newOtto = new Ottoman(consistency);
    const testBucket = await newOtto.connect(connOptions);
    expect(testBucket).toBeDefined();
    await testBucket.close();
  });
  test('Ensure Collections and Indexes (ABUSIVE METHOD)', async () => {
    const newOtto = new Ottoman(consistency);
    const testBucket = await newOtto.connect(connOptions);
    const UserModels: ModelTypes[] = [];
    expect.assertions(5);

    for (let i = 0; i < 5; i++) {
      UserModels[i] = testBucket.model('User' + i, UserSchema, { scopeName: 'Test' + i, collectionName: 'Test' + i });
      await testBucket.start();
      const newUser = new UserModels[i]({ userid: 'test' + i, firstName: 'Test' + i });
      await newUser.save();
      const results = (await UserModels[i].find({ firstName: 'Test' + i })).meta.status as string;
      expect(results).toBe('success');
    }

    await testBucket.close();
  });

  test('Ensure Collections and Indexes (NORMAL METHOD)', async () => {
    const newOtto = new Ottoman(consistency);
    const testBucket = await newOtto.connect(connOptions);
    const UserModels: ModelTypes[] = [];
    expect.assertions(5);

    for (let i = 5; i < 10; i++) {
      UserModels[i] = testBucket.model('User' + i, UserSchema, { scopeName: 'Test' + i, collectionName: 'Test' + i });
    }
    await testBucket.start();

    for (let i = 5; i < 10; i++) {
      const newUser = new UserModels[i]({ userid: 'test' + i, firstName: 'Test' + i });
      await newUser.save();
      const results = (await UserModels[i].find({ firstName: 'Test' + i })).meta.status as string;
      expect(results).toBe('success');
    }

    await testBucket.close();
  });
  test('Drop Collections', async () => {
    const newOtto = new Ottoman(consistency);
    const testBucket = await newOtto.connect(connOptions);

    expect.assertions(10);

    for (let i = 0; i < 10; i++) {
      const results = await testBucket.dropCollection('Test' + i, 'Test' + i);
      expect(results).toBeUndefined();
    }
    await testBucket.close();
  });

  test('Drop Scope', async () => {
    const newOtto = new Ottoman(consistency);
    const testBucket = await newOtto.connect(connOptions);

    expect.assertions(10);

    for (let i = 0; i < 10; i++) {
      const results = await testBucket.dropScope('Test' + i);
      expect(results).toBeUndefined();
    }
    await testBucket.close();
  });

  test('Drop Bucket', async () => {
    const otto = getDefaultInstance();
    const test = await otto.dropBucket('testBucket');
    expect(test).toBeUndefined();
  });
});
