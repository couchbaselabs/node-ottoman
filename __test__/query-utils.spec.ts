import { parseStringSelectExpr, getProjectionFields, Query, getCollectionKey, escapeReservedWords } from '../src';

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
    expect(result.projection).toBe(`\`travel-sample\`.*,${getCollectionKey()}`);
  });

  test('Test get Projections fields with select parameters', () => {
    const result = getProjectionFields('travel-sample', 'address, type');
    expect(result.fields).toStrictEqual(['address', 'type']);
    expect(result.projection).toBe(`address, type,${getCollectionKey()}`);
  });

  test('Test get Projections fields with an array in the select field', () => {
    const result = getProjectionFields('travel-sample', ['address', 'type']);
    expect(result.fields).toStrictEqual(['address', 'type']);
    expect(result.projection).toBe(`address,type,${getCollectionKey()}`);
  });

  test('Test get Projections fields using an expression in the select field', () => {
    const result = getProjectionFields('travel-sample', [{ $field: 'address' }, { $field: 'type' }]);
    expect(result.fields).toStrictEqual(['address', 'type']);
    expect(result.projection).toBe(`address,type,${getCollectionKey()}`);
  });

  test('Test get Projections fields with select using the Query Builder', () => {
    const result = getProjectionFields('travel-sample');
    const query = new Query({}, 'travel-sample').select(result.projection).limit(10).build();
    expect(query).toBe(`SELECT \`travel-sample\`.*,${getCollectionKey()} FROM \`travel-sample\` LIMIT 10`);
  });

  test('Test escape reserved words function', () => {
    const expr = escapeReservedWords('travel-sample[0].user.name.permissions[0].name-aux');
    const expr2 = escapeReservedWords('roles.name.permissions-admin');
    const expr3 = escapeReservedWords('travel-sample');
    expect(expr).toStrictEqual('`travel-sample`[0].`user`.name.permissions[0].`name-aux`');
    expect(expr2).toStrictEqual('roles.name.`permissions-admin`');
    expect(expr3).toStrictEqual('`travel-sample`');
  });
});
