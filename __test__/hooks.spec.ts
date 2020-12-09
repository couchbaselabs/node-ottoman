import { Schema, model, isDocumentNotFoundError, getDefaultInstance } from '../src';
import { delay, startInTest } from './testData';
const accessDoc2 = {
  type: 'hooks',
  isActive: false,
  name: 'Ottoman Hooks',
};

const removeDoc = {
  isActive: true,
  name: 'Remove',
};

const validateDoc = {
  isActive: true,
  name: 'Validate Doc',
};

const schema = {
  type: String,
  isActive: Boolean,
  name: String,
};

test('Hook.pre.save', async () => {
  const UserSchema = new Schema(schema);
  UserSchema.pre('save', async (document) => {
    await delay(300);
    document.name = 'async pre save';
  });

  const UserModel = model('User', UserSchema);
  await startInTest(getDefaultInstance());
  const result = await UserModel.create(accessDoc2);
  const userSaved = await UserModel.findById(result.id);
  expect(userSaved.name).toBe('async pre save');
});

test('Hook.post.save', async () => {
  const UserSchema = new Schema(schema);
  UserSchema.post('save', (document) => {
    document.name = 'async post save';
  });

  const UserModel = model('User', UserSchema);

  await startInTest(getDefaultInstance());

  const result = await UserModel.create(accessDoc2);
  expect(result).toBeDefined();
  expect(result.name).toBe('async post save');
});

test('Hook update', async () => {
  const UserSchema = new Schema(schema);
  UserSchema.pre('update', (document) => {
    document.name = 'async pre update';
  });

  UserSchema.post('update', (document) => {
    document.document = document;
  });

  const UserModel = model('User', UserSchema);

  await startInTest(getDefaultInstance());

  const user = new UserModel(accessDoc2);
  await user.save();
  expect(user.id).toBeDefined();
  expect(user.name).toBe(accessDoc2.name);
  await user.save();
  expect(user.name).toBe('async pre update');
  const userUpdated = await UserModel.findById(user.id);
  expect(userUpdated.name).toBe('async pre update');
  expect(user.document).toBeDefined();
  expect(user.document.name).toBe('async pre update');
});

test('Hook.pre.remove function', async () => {
  const UserSchema = new Schema(schema);

  UserSchema.pre('remove', (document) => {
    document.name = 'async pre remove';
  });

  const UserModel = model('User', UserSchema);

  await startInTest(getDefaultInstance());

  const user = new UserModel(removeDoc);
  await user.save();
  const userSaved = await UserModel.findById(user.id);
  expect(userSaved.id).toBeDefined();
  await user.remove();
  expect(user.name).toBe('async pre remove');
  try {
    await UserModel.findById(user.id);
  } catch (e) {
    expect(isDocumentNotFoundError(e)).toBe(true);
  }
});

test('Hook.pre.validate function', async () => {
  const UserSchema = new Schema(schema);

  UserSchema.pre('validate', (document) => {
    if (document.name === validateDoc.name) {
      const message = `Username '${validateDoc.name}' not allowed`;
      throw new Error(message);
    }
  });

  const UserModel = model('User', UserSchema);

  await startInTest(getDefaultInstance());

  const user = new UserModel(validateDoc);
  try {
    await user.save();
  } catch (e) {
    expect(e.message).toBe(`Username '${validateDoc.name}' not allowed`);
  }
});
