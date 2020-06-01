import { model } from '../lib';
import { DocumentNotFoundError } from 'couchbase';

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
  test('UserModel.create Creating a document', async () => {
    const UserModel = model('User', schema);
    const result = await UserModel.create(accessDoc);
    UserModel.update({ name: 'Updated' }, result._id);
    expect(result.token).toBeDefined();
  });

  test('UserModel.findById Get a document', async () => {
    const UserModel = model('User', schema);
    const result = await UserModel.create(accessDoc);
    const user = await UserModel.getById(result._id);
    expect(user.name).toBeDefined();
  });
  test('UserModel.findById expect to fail', async () => {
    const UserModel = model('User', schema);
    const key = 'not-found';
    try {
      await UserModel.getById(key);
      throw new Error('Fail');
    } catch (e) {
      expect(e).toBeInstanceOf(DocumentNotFoundError);
    }
  });

  test('UserModel.update Update a document', async () => {
    const UserModel = model('User', schema);
    const result = await UserModel.create(accessDoc);
    await UserModel.update(updateDoc, result._id);
    const user = await UserModel.getById(result._id);
    expect(user.isActive).toBe(true);
  });

  test('UserModel.replace Replace a document', async () => {
    const UserModel = model('User', schema);
    const result = await UserModel.create(accessDoc);
    await UserModel.replace(replaceDoc, result._id);
    const user = await UserModel.getById(result._id);
    expect(user.type).toBe('airlineZ Replace');
  });

  test('Document.save Saving a document and updating', async () => {
    const UserModel = model('User', schema);
    const user = new UserModel(accessDoc2);
    const result = await user.save();
    expect(result.token).toBeDefined();
    user.name = 'Instance Edited';
    user._id = result._id;
    const update = await user.save();
    expect(update.token).toBeDefined();
  });

  test('Remove saved document from Model instance', async () => {
    const UserModel = model('User', schema);
    const user = new UserModel(accessDoc2);
    const result = await user.save();
    expect(result._id).toBeDefined();
    user._id = result._id;
    const removed = await user.remove();
    expect(removed).toBeDefined();
  });

  test('Remove saved document from Model Constructor', async () => {
    const UserModel = model('User', schema);
    const user = new UserModel(accessDoc2);
    const result = await user.save();
    expect(result._id).toBeDefined();
    user._id = result._id;
    const removed = await UserModel.remove(result._id);
    expect(removed).toBeDefined();
  });

  test('Insert multiple document', async () => {
    const UserModel = model('User', schema);
    const result = await UserModel.insertMany([accessDoc, accessDoc]);
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ cas: expect.anything(), token: expect.anything() })]),
    );
  });
});
