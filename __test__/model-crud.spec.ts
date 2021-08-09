import {
  DocumentExistsError,
  DocumentNotFoundError,
  getDefaultInstance,
  isDocumentNotFoundError,
  model,
  Ottoman,
  Schema,
} from '../src';
import { OttomanError } from '../src/exceptions/ottoman-errors';
import { connectUri, consistency, startInTest } from './testData';

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
};

const schema = {
  type: String,
  isActive: Boolean,
  name: String,
};

interface IUser {
  type?: string;
  name?: string;
  isActive?: boolean;
}

describe('Test Document Access Functions', () => {
  test('UserModel.create Creating a document', async () => {
    const UserModel = model<IUser>('User', schema);
    await startInTest(getDefaultInstance());
    const result = await UserModel.create(accessDoc);
    expect(result.id).toBeDefined();
  });

  test('UserModel.findById Get a document', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const result = await UserModel.create(accessDoc);
    const user = await UserModel.findById(result.id);
    expect(user.name).toBeDefined();
  });

  test('UserModel.findById expect to fail', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const key = 'not-found';
    try {
      await UserModel.findById(key);
    } catch (e) {
      expect(e).toBeInstanceOf(DocumentNotFoundError);
    }
  });

  test('UserModel.update -> Update a document', async () => {
    const UserModel = model<IUser>('User', schema);
    await startInTest(getDefaultInstance());
    const result = await UserModel.create(accessDoc);
    await UserModel.updateById(result.id, updateDoc);
    const user = await UserModel.findById(result.id);
    expect(user.isActive).toBe(true);
  });

  test('UserModel.update -> Update a document, throw DocumentNotFound', async () => {
    const UserModel = model<IUser>('User', schema);
    await startInTest(getDefaultInstance());
    try {
      await UserModel.updateById('dummyID', updateDoc);
    } catch (e) {
      expect(e).toBeInstanceOf(DocumentNotFoundError);
    }
  });

  test('UserModel.replace Replace a document', async () => {
    const UserModel = model<IUser>('User', schema);
    await startInTest(getDefaultInstance());
    const result = await UserModel.create(accessDoc);
    await UserModel.replaceById(result.id, replaceDoc);
    const user = await UserModel.findById(result.id);
    expect(user.type).toBe('airlineZ Replace');
    expect(user.name).toBeUndefined();
  });

  test('UserModel.replace -> Replace a document, throw DocumentNotFound', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    try {
      await UserModel.replaceById('dummyID', updateDoc);
    } catch (e) {
      expect(e).toBeInstanceOf(DocumentNotFoundError);
    }
  });

  test('UserModel.replace -> Replace a document with custom idKey', async () => {
    const CUSTOM_ID_KEY = 'userListId';
    const UserModel = model('User', schema, { idKey: CUSTOM_ID_KEY });
    await startInTest(getDefaultInstance());
    const result = await UserModel.create({
      type: 'airline',
      isActive: false,
      name: 'Ottoman Access List Custom ID',
    });
    const document = await UserModel.replaceById(result[CUSTOM_ID_KEY], result);
    await UserModel.removeById(document[CUSTOM_ID_KEY]);
    expect(document).toBeDefined();
    expect(typeof document[CUSTOM_ID_KEY]).toBe('string');
    expect(result[CUSTOM_ID_KEY]).toStrictEqual(document[CUSTOM_ID_KEY]);
  });

  test('UserModel.updateById -> Replace a document with custom idKey', async () => {
    const CUSTOM_ID_KEY = 'userListId';
    const UserModel = model<IUser>('User', schema, { idKey: CUSTOM_ID_KEY });
    await startInTest(getDefaultInstance());
    const result = await UserModel.create({
      type: 'airline',
      isActive: false,
      name: 'Ottoman Access List Custom ID',
    });
    const document = await UserModel.updateById(result[CUSTOM_ID_KEY], { isActive: true });
    await UserModel.removeById(document[CUSTOM_ID_KEY]);
    expect(document).toBeDefined();
    expect(document.isActive).toBe(true);
    expect(typeof document[CUSTOM_ID_KEY]).toBe('string');
    expect(result[CUSTOM_ID_KEY]).toStrictEqual(document[CUSTOM_ID_KEY]);
  });

  test('Document.save Save and update a document', async () => {
    const UserModel = model('User', schema);
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
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const user = new UserModel(accessDoc2);
    await user.save();
    const removed = await user.remove();
    expect(user.id).toBeDefined();
    expect(removed.cas).toBeDefined();
  });

  test('Remove saved document from Model Constructor', async () => {
    const UserSchema = new Schema(schema);
    const UserModel = model('User', UserSchema);
    await startInTest(getDefaultInstance());
    const user = new UserModel(accessDoc2);
    const result = await user.save();
    expect(result.id).toBeDefined();
    user.id = result.id;
    const removed = await UserModel.removeById(result.id);
    expect(removed.cas).toBeDefined();
  });

  test('document.remove function on custom scope', async () => {
    if (process.env.OTTOMAN_LEGACY_TEST) {
      expect(1).toBe(1);
    } else {
      const removeDoc = {
        isActive: true,
        name: 'Crud Remove',
      };
      const UserSchema = new Schema(schema);

      const UserModel = model('User', UserSchema, { scopeName: 'myScope' });
      const ottoman = getDefaultInstance();
      await startInTest(ottoman);
      const user = new UserModel(removeDoc);
      await user.save();
      const userSaved = await UserModel.findById(user.id);
      expect(userSaved.id).toBeDefined();
      await user.remove();
      try {
        await UserModel.findById(user.id);
      } catch (e) {
        expect(isDocumentNotFoundError(e)).toBe(true);
      }
    }
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

  test('UserModel count function', async () => {
    const UserModel = model<IUser>('User', schema);
    await startInTest(getDefaultInstance());
    await UserModel.create(accessDoc);
    const count = await UserModel.count();
    expect(count).toBeGreaterThan(0);
  });

  test('UserModel count function no result errors', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    try {
      await UserModel.count({ count: { $like: 'UserModelTestError' } });
    } catch (e) {
      const { message } = e;
      expect(e).toBeInstanceOf(OttomanError);
      expect(message).toBe('The query did not return any results.');
    }
  });

  test('UserModel findOne function, also check return correct custom idKey', async () => {
    const CUSTOM_ID_KEY = 'userId';
    const UserModel = model<IUser>('User', schema, { idKey: CUSTOM_ID_KEY });
    await startInTest(getDefaultInstance());
    await UserModel.create({
      type: 'airline',
      isActive: false,
      name: 'Ottoman Access Find One',
    });
    const document = await UserModel.findOne({ name: 'Ottoman Access Find One' }, consistency);
    expect(document).toBeTruthy();
    expect(typeof document[CUSTOM_ID_KEY]).toBe('string');
  });

  test('UserModel find function, also check return correct custom idKey', async () => {
    const CUSTOM_ID_KEY = 'userListId';
    const UserModel = model<IUser>('User', schema, { idKey: CUSTOM_ID_KEY });
    await startInTest(getDefaultInstance());
    await UserModel.create({
      type: 'airline',
      isActive: false,
      name: 'Ottoman Access List Custom ID',
    });
    const documents = await UserModel.find({ name: 'Ottoman Access List Custom ID' }, consistency);
    expect(documents.rows).toBeDefined();
    const document = documents.rows[0];
    expect(typeof document[CUSTOM_ID_KEY]).toBe('string');
  });

  test('UserModel findOne function, throw DocumentNotFoundError', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    try {
      await UserModel.findOne({ name: 'Search Example' }, consistency);
    } catch (e) {
      expect(e).toBeInstanceOf(DocumentNotFoundError);
    }
  });

  test('UserModel save with arbitrary id', async () => {
    const CUSTOM_ID_KEY = 'airlineId';
    const UserModel = model('User', schema, { idKey: CUSTOM_ID_KEY });
    const user = new UserModel({
      [CUSTOM_ID_KEY]: 'Airline-1',
      type: 'airline',
      isActive: false,
      name: 'Ottoman Access List',
    });
    await user.save();
    const document = await UserModel.findById(user[CUSTOM_ID_KEY]);
    expect(document[CUSTOM_ID_KEY]).toBe(user[CUSTOM_ID_KEY]);
  });

  test('UserModel create with arbitrary id', async () => {
    const UserModel = model('User', schema);
    const id = `Airline-Key-${Date.now()}`;
    const user = await UserModel.create({
      id,
      type: 'airline',
      isActive: false,
      name: 'Ottoman Access List',
    });
    const document = await UserModel.findById(user.id);
    expect(document.id).toBe(user.id);
  });

  test('UserModel custom idKey and keyGenerator', async () => {
    const keyGenerator = ({ metadata }) => `${metadata.scopeName}--${metadata.collectionName}`;
    const idKey = 'airlineKey';
    const key = `Airline-Key-${Date.now()}`;
    const UserModel = model('Airlines', schema, { keyGenerator, idKey });
    await startInTest(getDefaultInstance());
    const user = await UserModel.create({
      [idKey]: key,
      type: 'airline',
      isActive: false,
      name: 'Ottoman Access List',
    });
    const document = await UserModel.findById(user[idKey]);
    expect(document[idKey]).toBe(user[idKey]);
    expect(document[idKey]).toBe(key);
  });

  test('UserModel keyGeneratorDelimiter at Model Level', async () => {
    const Model = model('Airlines', schema, { keyGeneratorDelimiter: '__' });
    await startInTest(getDefaultInstance());
    const user = await Model.create({
      type: 'airline',
      isActive: false,
      name: 'Ottoman Access List',
    });
    const result = await Model.find({ id: user.id }, { select: 'meta().id', ...consistency });
    const document = result.rows[0];
    expect(document).toBeDefined();
    expect(document.id.startsWith('Airlines__')).toBeDefined();
  });

  test('UserModel keyGeneratorDelimiter at Instance Level', async () => {
    const ottoman2 = new Ottoman({ keyGeneratorDelimiter: '__', collectionName: '_default' });
    ottoman2.connect(connectUri);
    const Model = ottoman2.model('Airlines', schema);
    await startInTest(ottoman2);
    const user = await Model.create({
      type: 'airline',
      isActive: false,
      name: 'Ottoman Access List',
    });
    const result = await Model.find({ id: user.id }, { select: 'meta().id', ...consistency });
    const document = result.rows[0];
    await ottoman2.close();
    expect(document).toBeDefined();
    expect(document.id.startsWith('Airlines__')).toBeDefined();
  });

  test('UserModel save enforce createOnly', async () => {
    const keyGenerator = ({ metadata }) => `${metadata.scopeName}--${metadata.collectionName}`;
    const idKey = 'airlineKey';
    const key = `Airline-Key-${Date.now()}`;
    const document = {
      [idKey]: key,
      type: 'airline',
      isActive: false,
      name: 'Ottoman Access List',
    };
    const Airlines = model('Airlines', schema, { keyGenerator, idKey });
    await startInTest(getDefaultInstance());
    const airline = await Airlines.create(document);
    expect(document[idKey]).toBe(airline[idKey]);
    try {
      await Airlines.create(document);
    } catch (e) {
      expect(e).toBeInstanceOf(DocumentExistsError);
    }
  });
});
