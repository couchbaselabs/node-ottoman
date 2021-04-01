import { buildWhereClauseExpr, getDefaultInstance, LogicalWhereExpr, model } from '../src';
import { delay, startInTest } from './testData';

describe('Options to ignore case', () => {
  const doc = {
    type: 'airline',
    isActive: false,
    name: 'Ottoman Access Find Lean',
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
    const { id } = await UserModel.create(doc);
    await delay(500);
    const { rows: documents } = await UserModel.find({ name: { $eq: 'oTToman aCCess find lean', $ignoreCase: true } });
    await UserModel.removeById(id);
    expect(documents[0].name).toStrictEqual('Ottoman Access Find Lean');
  });

  test('Using find $like', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id } = await UserModel.create(doc);
    await delay(500);
    const { rows: documents } = await UserModel.find({
      name: { $like: 'oTToman aCCess find lean', $ignoreCase: true },
    });
    await UserModel.removeById(id);
    expect(documents[0].name).toStrictEqual('Ottoman Access Find Lean');
  });
});
