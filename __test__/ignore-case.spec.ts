import { buildWhereClauseExpr, getDefaultInstance, LogicalWhereExpr, model, Query } from '../src';
import { delay, startInTest } from './testData';

describe('Options to ignore case', () => {
  const doc1 = {
    type: 'airline',
    isActive: false,
    name: 'Ottoman Access Find',
  };
  const doc2 = {
    type: 'airline',
    isActive: false,
    name: 'OTTOMAN ACCESS FIND',
  };
  const schema = {
    type: String,
    isActive: Boolean,
    name: String,
  };
  test(`Ignore case with buildWhereClause`, () => {
    const where01: LogicalWhereExpr = {
      name: 'John',
    } as LogicalWhereExpr;
    const where02: LogicalWhereExpr = {
      name: { $eq: 'John' },
    } as LogicalWhereExpr;
    expect(buildWhereClauseExpr('', where01)).toStrictEqual(buildWhereClauseExpr('', where02));

    const where1: LogicalWhereExpr = {
      name: { $eq: 'John', $ignoreCase: true },
    } as LogicalWhereExpr;
    expect(buildWhereClauseExpr('', where1)).toStrictEqual('(LOWER(name) = LOWER("John"))');

    const where2: LogicalWhereExpr = {
      name: { $like: 'John', $ignoreCase: true },
    } as LogicalWhereExpr;
    expect(buildWhereClauseExpr('', where2)).toStrictEqual('(LOWER(name) LIKE LOWER("John"))');

    const where3: LogicalWhereExpr = {
      name: { $like: 'John', $eq: 'John', $ignoreCase: true },
    } as LogicalWhereExpr;
    expect(buildWhereClauseExpr('', where3)).toStrictEqual(
      '(LOWER(name) LIKE LOWER("John") AND LOWER(name) = LOWER("John"))',
    );

    const where4: LogicalWhereExpr = {
      name: 'John',
    } as LogicalWhereExpr;
    expect(buildWhereClauseExpr('', where4, true)).toStrictEqual('LOWER(name) = LOWER("John")');
  });

  test('Test ignoreCase false value', async () => {
    const where = { name: { $eq: 'oTToman aCCess', $ignoreCase: false } };
    const result = buildWhereClauseExpr('', where);
    expect(result).toBe('(name="oTToman aCCess")');
  });

  test('Test ignoreCase boolean exception', async () => {
    const where = { name: { $eq: 'oTToman aCCess', $ignoreCase: 'true' } };
    const test = () => buildWhereClauseExpr('', where);
    expect(test).toThrow(new TypeError('The data type of $ignoreCase must be Boolean'));
  });

  test('Using find $eq', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id } = await UserModel.create(doc1);
    await delay(500);
    const { rows: documents } = await UserModel.find({ name: { $eq: 'oTToman aCCess find', $ignoreCase: true } });
    await UserModel.removeById(id);
    expect(documents[0].name).toStrictEqual('Ottoman Access Find');
  });

  test('Using find $like', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id } = await UserModel.create(doc1);
    await delay(500);
    const { rows: documents } = await UserModel.find({
      name: { $like: 'oTToman aCCess find', $ignoreCase: true },
    });
    await UserModel.removeById(id);
    expect(documents[0].name).toStrictEqual('Ottoman Access Find');
  });

  test('Using find with ignoreCase options', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id } = await UserModel.create(doc1);
    await delay(1500);

    const { rows: documents } = await UserModel.find(
      {
        name: { $like: 'oTToman aCCess find' },
      },
      { ignoreCase: true },
    );
    await UserModel.removeById(id);
    expect(documents[0].name).toStrictEqual('Ottoman Access Find');
  });

  test('Using find with ignoreCase options without filters clause', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id } = await UserModel.create(doc1);
    await delay(1500);

    const { rows: documents } = await UserModel.find(
      {
        name: 'oTToman aCCess find',
      },
      { ignoreCase: true },
    );
    await UserModel.removeById(id);
    expect(documents[0].name).toStrictEqual('Ottoman Access Find');
  });

  test('Using find with ignoreCase option overwrite in property ', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id: id1 } = await UserModel.create(doc1);
    const { id: id2 } = await UserModel.create(doc2);
    await delay(500);

    const { rows: documents } = await UserModel.find(
      {
        name: { $like: 'OTTOMAN ACCESS FIND', $ignoreCase: false },
      },
      { ignoreCase: true },
    );
    await UserModel.removeById(id1);
    await UserModel.removeById(id2);
    expect(documents[0].id).toStrictEqual(id2);
    expect(documents[0].name).toStrictEqual('OTTOMAN ACCESS FIND');
  });

  test('Using findOne with ignoreCase option', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id: idToRemove } = await UserModel.create(doc1);
    await delay(500);

    const { id, name } = await UserModel.findOne(
      {
        name: { $like: 'oTToman aCCess find' },
      },
      { ignoreCase: true },
    );
    await UserModel.removeById(idToRemove);
    expect(id).toStrictEqual(idToRemove);
    expect(name).toStrictEqual('Ottoman Access Find');
  });
  test('Using findOne with ignoreCase option without $like or $eq', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id: idToRemove } = await UserModel.create(doc1);
    await delay(500);

    const { id, name } = await UserModel.findOne(
      {
        name: 'oTToman aCCess find',
      },
      { ignoreCase: true },
    );
    await UserModel.removeById(idToRemove);
    expect(id).toStrictEqual(idToRemove);
    expect(name).toStrictEqual('Ottoman Access Find');
  });

  test('Where expresion with $like->$ignoreCase:false and build options ignoreCase:true', () => {
    const expr_where = {
      $or: [{ address: { $like: '%57-59%', $ignoreCase: false } }, { free_breakfast: true }, { name: { $eq: 'John' } }],
    };
    const query = new Query({}, 'travel-sample');
    const result = query
      .select([{ $field: 'address' }])
      .where(expr_where)
      .build({ ignoreCase: true });
    expect(result).toBe(
      'SELECT address FROM `travel-sample` WHERE ((address LIKE "%57-59%") OR free_breakfast=true OR LOWER(name) = LOWER("John"))',
    );
  });

  test('Where expresion with $eq->$ignoreCase:false and build options ignoreCase:true', () => {
    const expr_where = {
      $or: [
        { address: { $like: '%nY-CitY%' } },
        { free_breakfast: true },
        { name: { $eq: 'John', $ignoreCase: false } },
      ],
    };
    const query = new Query({}, 'travel-sample');
    const result = query
      .select([{ $field: 'address' }])
      .where(expr_where)
      .build({ ignoreCase: true });
    expect(result).toBe(
      'SELECT address FROM `travel-sample` WHERE (LOWER(address) LIKE LOWER("%nY-CitY%") OR free_breakfast=true OR (name="John"))',
    );
  });
});
