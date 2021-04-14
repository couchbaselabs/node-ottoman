import { FindOptions, getDefaultInstance, model, SearchConsistency, Schema } from '../src';
import { delay, startInTest } from './testData';

describe('Test Model Find projection', () => {
  const SchemaBase = {
    type: String,
    isActive: Boolean,
    name: String,
  };
  const schema = new Schema(SchemaBase);
  const CUSTOM_ID_KEY = 'userListId';

  test('UserModel find function', async () => {
    const UserModel = model('User', schema, { idKey: CUSTOM_ID_KEY });
    await startInTest(getDefaultInstance());
    await UserModel.create({
      type: 'airline',
      isActive: false,
      name: 'Ottoman Access List Custom ID',
    });
    const filter = { name: 'Ottoman Access List Custom ID' };
    const options: FindOptions = { consistency: SearchConsistency.LOCAL, lean: true };
    const documents = await UserModel.find(filter, options);
    options.select = ['_type'];
    const documents1 = await UserModel.find(filter, options);
    await delay(300);
    const document = documents.rows[0];
    const document1 = documents1.rows[0];
    await UserModel.removeMany(filter);
    expect(document).toBeDefined();
    expect(
      Object.keys(document)
        .sort((a, b) => (a < b ? -1 : 1))
        .join(','),
    ).toBe('isActive,name,type,userListId');
    expect(document1).toStrictEqual({ _type: 'User' });
  });
  test('UserModel find function non strict schema', async () => {
    schema.options.strict = false;
    const UserModel = model('User', schema, { idKey: CUSTOM_ID_KEY });
    await startInTest(getDefaultInstance());
    await UserModel.create({
      type: 'airline',
      isActive: false,
      name: 'Ottoman Access List Custom ID',
      noExistOnSchema: true,
    });
    const filter = { name: 'Ottoman Access List Custom ID' };
    const options: FindOptions = { consistency: SearchConsistency.LOCAL, lean: true };
    const documents = await UserModel.find(filter, options);
    options.select = ['name'];
    const documents1 = await UserModel.find(filter, options);
    await delay(300);
    const document = documents.rows[0];
    const document1 = documents1.rows[0];
    await UserModel.removeMany(filter);
    expect(document).toBeDefined();
    expect(
      Object.keys(document)
        .sort((a, b) => (a < b ? -1 : 1))
        .join(','),
    ).toBe('_type,isActive,name,noExistOnSchema,type,userListId');
    expect(document1).toStrictEqual({ _type: 'User', name: 'Ottoman Access List Custom ID' });
  });
});
