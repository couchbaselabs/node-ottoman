import { model, Schema, ensureIndexes } from '../lib';
import { isDocumentNotFoundError } from '../lib/utils/is-not-found';

const accessDoc = {
  type: 'airlineR',
  isActive: false,
  name: 'Ottoman Access',
};

const accessDoc2 = {
  type: 'airlineZ',
  isActive: false,
  name: 'Ottoman Access',
};

const updateDoc = {
  isActive: true,
};

const replaceDoc = {
  type: 'airlineZ Replace',
  isActive: false,
  name: 'Ottoman Access',
};

const schema = {
  type: String,
  isActive: Boolean,
  name: String,
};

describe('Test Document Access Functions', () => {
  beforeEach(async () => {
    await ensureIndexes();
  });

  test('UserModel.create Creating a document', async () => {
    const UserModel = model('User', schema);
    const result = await UserModel.create(accessDoc);
    UserModel.update({ name: 'Updated' }, result.id);
    expect(result.token).toBeDefined();
  });

  test('UserModel.findById Get a document', async () => {
    const UserModel = model('User', schema);
    const result = await UserModel.create(accessDoc);
    const user = await UserModel.findById(result.id);
    expect(user.name).toBeDefined();
  });
  test('UserModel.findById expect to fail', async () => {
    const UserModel = model('User', schema);
    const key = 'not-found';
    try {
      await UserModel.findById(key);
      throw new Error('Fail');
    } catch (e) {
      expect(isDocumentNotFoundError(e)).toBe(true);
    }
  });

  test('UserModel.update -> Update a document', async () => {
    const UserModel = model('User', schema);
    const result = await UserModel.create(accessDoc);
    await UserModel.update(updateDoc, result.id);
    const user = await UserModel.findById(result.id);
    expect(user.isActive).toBe(true);
  });

  test('UserModel.replace Replace a document', async () => {
    const UserModel = model('User', schema);
    const result = await UserModel.create(accessDoc);
    await UserModel.replace(replaceDoc, result.id);
    const user = await UserModel.findById(result.id);
    expect(user.type).toBe('airlineZ Replace');
  });

  test('Document.save Save and update a document', async () => {
    const UserModel = model('User', schema);
    const user = new UserModel(accessDoc2);
    const result = await user.save();
    expect(result.token).toBeDefined();
    user.name = 'Instance Edited';
    user.id = result.id;
    const update = await user.save();
    expect(update.token).toBeDefined();
  });

  test('Remove saved document from Model instance', async () => {
    const UserModel = model('User', schema);
    const user = new UserModel(accessDoc2);
    const result = await user.save();
    expect(result.id).toBeDefined();
    user.id = result.id;
    const removed = await user.remove();
    expect(removed.cas).toBeDefined();
  });

  test('Remove saved document from Model Constructor', async () => {
    const UserSchema = new Schema(schema);
    const UserModel = model('User', UserSchema);
    const user = new UserModel(accessDoc2);
    const result = await user.save();
    expect(result.id).toBeDefined();
    user.id = result.id;
    const removed = await UserModel.remove(result.id);
    expect(removed.cas).toBeDefined();
  });

  test('Test Schema Methods', async () => {
    const UserSchema = new Schema(schema);
    UserSchema.methods.getType = function () {
      return `method: getType -> ${this.type}`;
    };
    const UserModel = model('User', UserSchema);
    const user = new UserModel(accessDoc2);
    expect(user.getType()).toBe(`method: getType -> ${accessDoc2.type}`);
  });

  test('Test Schema Statics', async () => {
    const UserSchema = new Schema(schema);
    UserSchema.statics.getCats = function () {
      return 'static: getCats';
    };
    const UserModel = model('User', UserSchema);
    expect(UserModel.getCats()).toBe('static: getCats');
  });

  test('UserModel count items', async () => {
    const UserModel = model('User', schema);
    await UserModel.create(accessDoc);
    const count = await UserModel.count();
    expect(count).toBeGreaterThan(0);
  });

  test('UserModel find items without params', async () => {
    const UserModel = model('User', schema);
    const result = await UserModel.find();
    expect(result.rows).toBeDefined();
  });
});
