import { parseStringSelectExpr, getProjectionFields, Query, escapeReservedWords } from '../src';
import { escapeFromClause } from '../src/query/utils';

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
