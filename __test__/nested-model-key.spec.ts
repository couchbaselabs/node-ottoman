import { getDefaultInstance, model } from '../src';
import { startInTest } from './testData';

const accessDoc = {
  type: 'airlineR',
  isActive: false,
  name: 'Ottoman Access',
};

const accessDoc2 = {
  type: 'airlineNested',
  isActive: false,
  name: 'Ottoman Access Nested',
};

const updateDoc = {
  isActive: true,
};

const replaceDoc = {
  type: 'airlineNested Replace',
  isActive: false,
};

const schema = {
  type: String,
  isActive: Boolean,
  name: String,
};

interface IUser {
  type: string;
  name?: string;
  isActive?: boolean;
}

describe('nested model key', function () {
  test('UserModel.create Creating a document', async () => {
    const UserModel = model<IUser>('UserNested', schema, { modelKey: 'metadata.doc_type' });
    await startInTest(getDefaultInstance());
    const result = await UserModel.create(accessDoc);
    expect(result.id).toBeDefined();
  });

  test('UserModel.findById Get a document', async () => {
    const UserModel = model('UserNested', schema, { modelKey: 'metadata.doc_type' });
    await startInTest(getDefaultInstance());
    const result = await UserModel.create(accessDoc);
    const user = await UserModel.findById(result.id);
    expect(user.name).toBeDefined();
  });

  test('UserModel.update -> Update a document', async () => {
    const UserModel = model<IUser>('UserNested', schema, { modelKey: 'metadata.doc_type' });
    await startInTest(getDefaultInstance());
    const result = await UserModel.create(accessDoc);
    await UserModel.updateById(result.id, updateDoc);
    const user = await UserModel.findById(result.id);
    expect(user.isActive).toBe(true);
  });

  test('UserModel.replace Replace a document', async () => {
    const UserModel = model<IUser>('UserNested', schema, { modelKey: 'metadata.doc_type' });
    await startInTest(getDefaultInstance());
    const result = await UserModel.create(accessDoc);
    await UserModel.replaceById(result.id, replaceDoc);
    const user = await UserModel.findById(result.id);
    expect(user.type).toBe('airlineNested Replace');
    expect(user.name).toBeUndefined();
  });

  test('Document.save Save and update a document', async () => {
    const UserModel = model('UserNested', schema, { modelKey: 'metadata.doc_type' });
    await startInTest(getDefaultInstance());
    const user = new UserModel(accessDoc2);
    const result = await user.save();
    expect(user.id).toBeDefined();
    user.name = 'Instance Edited';
    user.id = result.id;
    const updated = await user.save();
    expect(updated.name).toBe('Instance Edited');
  });

  test('Remove saved document from Model instance', async () => {
    const UserModel = model('UserNested', schema, { modelKey: 'metadata.doc_type' });
    await startInTest(getDefaultInstance());
    const user = new UserModel(accessDoc2);
    await user.save();
    const removed = await user.remove();
    expect(user.id).toBeDefined();
    expect(removed.cas).toBeDefined();
  });
});
