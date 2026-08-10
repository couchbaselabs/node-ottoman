import { buildIndexExpr, IIndexOnParams, Query } from '../src';
import { BuildIndexQueryError, BuildQueryError } from '../src/exceptions/ottoman-errors';
import { WhereClauseException } from '../src/query/exceptions';

describe('Test N1QL injection hardening', () => {
  test('A string value containing a double quote cannot terminate the literal', async () => {
    const injected = 'x" OR 1=1 OR name="';
    const query = new Query({}, 'travel-sample').select('*').where({ name: injected }).build();

    // The value must survive as a single escaped literal, not as extra N1QL syntax.
    expect(query).toStrictEqual(`SELECT * FROM \`travel-sample\` WHERE name=${JSON.stringify(injected)}`);
    expect(query).not.toContain('OR 1=1 OR name=""');
  });

  test('Backslashes in a value are preserved instead of being stripped', async () => {
    const windowsPath = 'C:\\Users\\bob';
    const query = new Query({}, 'travel-sample').select('*').where({ path: windowsPath }).build();

    expect(query).toStrictEqual(`SELECT * FROM \`travel-sample\` WHERE \`path\`=${JSON.stringify(windowsPath)}`);
  });

  test('A quote inside a USE KEYS value cannot introduce another key', async () => {
    const injected = 'a" , "b';
    const query = new Query({}, 'travel-sample').select('*').useKeys([injected]).build();

    expect(query).toStrictEqual(`SELECT * FROM \`travel-sample\` USE KEYS ${JSON.stringify([injected])}`);
  });

  test('A quote inside a comparison value cannot terminate the literal', async () => {
    const injected = '%57%" OR "1"="1';
    const query = new Query({}, 'travel-sample')
      .select('*')
      .where({ address: { $like: injected } })
      .build();

    expect(query).toStrictEqual(`SELECT * FROM \`travel-sample\` WHERE address LIKE ${JSON.stringify(injected)}`);
  });

  test('An ORDER BY direction that is not ASC or DESC is rejected', async () => {
    const build = () =>
      new Query({}, 'travel-sample')
        .select('*')
        .orderBy({ name: 'ASC, (SELECT 1)' as any })
        .build();

    expect(build).toThrow(BuildQueryError);
  });

  test('An index ON sort direction that is not ASC or DESC is rejected', async () => {
    const on = [{ name: 'callsign', sort: 'ASC"] , ["injected' }] as unknown as IIndexOnParams[];

    expect(() => buildIndexExpr('travel-sample', 'CREATE', 'idx_test', on)).toThrow(BuildQueryError);
  });

  test('Valid sort directions are still accepted and normalised', async () => {
    const query = new Query({}, 'travel-sample').select('*').orderBy({ name: 'DESC' }).build();

    expect(query).toStrictEqual('SELECT * FROM `travel-sample` ORDER BY name DESC');
  });

  test('A WHERE key that is not a field path is rejected', async () => {
    const build = () =>
      new Query({}, 'travel-sample')
        .select('*')
        .where({ 'a) OR 1=1 --': 'v' })
        .build();

    expect(build).toThrow(WhereClauseException);
  });

  test('A WHERE key that is not a field path is rejected for comparison operators too', async () => {
    const build = () =>
      new Query({}, 'travel-sample')
        .select('*')
        .where({ 'a) OR 1=1 --': { $gt: 1 } })
        .build();

    expect(build).toThrow(WhereClauseException);
  });

  test('Legitimate field paths are still accepted', async () => {
    const query = new Query({}, 'travel-sample')
      .select('*')
      .where({ 'address.city': 'Paris', 'numbers[0]': 3, 'travel-sample.callsign': { $like: '%AF%' } })
      .build();

    expect(query).toStrictEqual(
      'SELECT * FROM `travel-sample` WHERE address.city="Paris" AND numbers[0]=3 AND `travel-sample`.callsign LIKE "%AF%"',
    );
  });

  test('A quote in a collection-operator literal cannot terminate it', async () => {
    const query = new Query({}, 'travel-sample t')
      .select('*')
      .where({ ['"a" OR 1=1 OR "b"']: { $within: { $field: 't' } } })
      .build();

    expect(query).toStrictEqual(
      `SELECT * FROM \`travel-sample\` t WHERE ${JSON.stringify('a" OR 1=1 OR "b')} WITHIN t`,
    );
  });

  test('A backtick in an index name cannot close the identifier quoting', async () => {
    const index = buildIndexExpr('travel-sample', 'DROP', 'idx` ; DROP INDEX `other');

    expect(index).toStrictEqual('DROP INDEX `travel-sample`.`idx`` ; DROP INDEX ``other`');
  });

  test('A backtick in the collection name cannot close the identifier quoting', async () => {
    const index = buildIndexExpr('bucket` ; SELECT 1 FROM `x', 'DROP', 'idx_test');

    expect(index).toStrictEqual('DROP INDEX `bucket`` ; SELECT 1 FROM ``x`.`idx_test`');
  });

  test('An unsupported index statement is rejected', async () => {
    expect(() => buildIndexExpr('travel-sample', 'DROP INDEX x; CREATE' as any, 'idx_test')).toThrow(
      BuildIndexQueryError,
    );
  });

  test('Valid index expressions are unchanged', async () => {
    const on: IIndexOnParams[] = [{ name: 'callsign', sort: 'ASC' }];

    expect(buildIndexExpr('travel-sample', 'CREATE', 'idx_test', on)).toStrictEqual(
      'CREATE INDEX `idx_test` ON `travel-sample`(callsign["ASC"])  ',
    );
    expect(buildIndexExpr('travel-sample', 'DROP', 'idx_test')).toStrictEqual('DROP INDEX `travel-sample`.`idx_test`');
  });
});
