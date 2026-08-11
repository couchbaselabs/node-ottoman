import { parseStringSelectExpr, getProjectionFields, Query, escapeReservedWords } from '../src';
import { escapeFieldPath, escapeFromClause, escapeIdentifier } from '../src/query/utils';

describe('Test Query Builder Utils', () => {
  test('Test the conversion of select expression into an Array of selection keys', async () => {
    const expr = "DISTINCT (RAW (COUNT('address') as addr, address))";

    const result = parseStringSelectExpr(expr);

    expect(result).toStrictEqual(['addr', 'address']);
  });

  test('Test the conversion of simple string select into an Array of selection keys', async () => {
    const expr = 'address';

    const result = parseStringSelectExpr(expr);

    expect(result).toStrictEqual(['address']);
  });

  test('Result modifier keywords are stripped when there is no alias', async () => {
    expect(parseStringSelectExpr('DISTINCT a, b as c')).toStrictEqual(['a', 'c']);
    expect(parseStringSelectExpr('RAW type, address')).toStrictEqual(['type', 'address']);
  });

  test('A field whose name contains a keyword is not mangled', async () => {
    expect(parseStringSelectExpr('allowed, values as v')).toStrictEqual(['allowed', 'v']);
  });

  test('escapeIdentifier quotes an identifier and doubles embedded backticks', async () => {
    expect(escapeIdentifier('travel-sample')).toStrictEqual('`travel-sample`');
    expect(escapeIdentifier('idx` ; DROP INDEX `other')).toStrictEqual('`idx`` ; DROP INDEX ``other`');
  });

  test('escapeFieldPath quotes each segment so a nested path stays a path', async () => {
    expect(escapeFieldPath('_type')).toStrictEqual('`_type`');
    expect(escapeFieldPath('metadata.doc_type')).toStrictEqual('`metadata`.`doc_type`');
    expect(escapeFieldPath('a`.`b')).toStrictEqual('`a```.```b`');
  });

  test('Test get Projections fields with an empty select', () => {
    const result = getProjectionFields('travel-sample', '');
    expect(result.fields).toStrictEqual([]);
    expect(result.projection).toBe(`\`travel-sample\`.*`);
  });

  test('Test get Projections fields with select parameters', () => {
    const result = getProjectionFields('travel-sample', 'address, type');
    expect(result.fields).toStrictEqual(['address', 'type']);
    expect(result.projection).toBe(`address, type,_type`);
  });

  test('Test get Projections fields with an array in the select field', () => {
    const result = getProjectionFields('travel-sample', ['address', 'type']);
    expect(result.fields).toStrictEqual(['address', 'type']);
    expect(result.projection).toBe(`address,type,_type`);
  });

  test('Test get Projections fields using an expression in the select field', () => {
    const result = getProjectionFields('travel-sample', [{ $field: 'address' }, { $field: 'type' }]);
    expect(result.fields).toStrictEqual(['address', 'type']);
    expect(result.projection).toBe(`address,type,_type`);
  });

  test('Test get Projections fields with select using the Query Builder', () => {
    const result = getProjectionFields('travel-sample');
    const query = new Query({}, 'travel-sample').select(result.projection).limit(10).build();
    expect(query).toBe(`SELECT \`travel-sample\`.* FROM \`travel-sample\` LIMIT 10`);
  });

  test('Test escape reserved words function', () => {
    const expr = escapeReservedWords('travel-sample[0].user.name.permissions[0].name-aux');
    const expr2 = escapeReservedWords('roles.name.permissions-admin');
    const expr3 = escapeReservedWords('travel-sample');
    expect(expr).toStrictEqual('`travel-sample`[0].`user`.name.permissions[0].`name-aux`');
    expect(expr2).toStrictEqual('roles.name.`permissions-admin`');
    expect(expr3).toStrictEqual('`travel-sample`');
  });

  test('A negative array subscript is not quoted as a dashed identifier', async () => {
    expect(escapeReservedWords('numbers[-1]')).toStrictEqual('numbers[-1]');
    expect(escapeReservedWords('a.numbers[-2].b')).toStrictEqual('a.numbers[-2].b');
  });

  test('A dashed name is quoted regardless of case', async () => {
    expect(escapeReservedWords('Travel-Sample')).toStrictEqual('`Travel-Sample`');
  });

  test('A dash-free name of any length is escaped in linear time', async () => {
    // The dash-quoting pass used to be quadratic: a long name with no dash made the
    // engine backtrack from every start position. At this size that took minutes.
    const field = `${'0'.repeat(200000)}.x`;

    expect(escapeReservedWords(field)).toStrictEqual(field);
  });

  test('A name with several dashes is quoted as one identifier', async () => {
    expect(escapeReservedWords('a-b-c')).toStrictEqual('`a-b-c`');
  });

  test('escape fromClause', () => {
    const escaped = escapeFromClause('travel-sample');
    expect(escaped).toBe('`travel-sample`');

    const escaped2 = escapeFromClause('`travel-sample`');
    expect(escaped2).toBe('`travel-sample`');

    const escapeAlias = escapeFromClause('travel-sample t');
    expect(escapeAlias).toBe('`travel-sample` t');

    const escapeAlias2 = escapeFromClause('`travel-sample` t');
    expect(escapeAlias2).toBe('`travel-sample` t');

    const escapedCollection = escapeFromClause('travel-sample._default.users');
    expect(escapedCollection).toBe('`travel-sample`.`_default`.`users`');

    const escapedCollectionAlias = escapeFromClause('travel-sample._default.users users');
    expect(escapedCollectionAlias).toBe('`travel-sample`.`_default`.`users` users');

    const escapedCollection2 = escapeFromClause('`travel-sample`._default.users');
    expect(escapedCollection2).toBe('`travel-sample`.`_default`.`users`');

    const escapedCollection3 = escapeFromClause('`travel-sample`.`_default`.`users` users');
    expect(escapedCollection3).toBe('`travel-sample`.`_default`.`users` users');

    const escapedCollectionFixExtraBacksticks = escapeFromClause('`travel-sample._default.users users`');
    expect(escapedCollectionFixExtraBacksticks).toBe('`travel-sample`.`_default`.`users` users');
  });
});
