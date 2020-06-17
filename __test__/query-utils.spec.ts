import { parseStringSelectExpr, getProjectionFields, Query } from '../lib';

describe('Test Query Builder Utils', () => {
  test('Test convert select expression into Array of selection keys', async () => {
    const expr = "DISTINCT (RAW (COUNT('address') as addr, address))";

    const result = parseStringSelectExpr(expr);

    expect(result).toStrictEqual(['addr', 'address']);
  });

  test('Test get Projections fields with empty select', () => {
    const result = getProjectionFields('travel-sample', '');
    expect(result.fields).toStrictEqual([]);
    expect(result.projection).toBe('`travel-sample`.*,_type,META().id as id');
  });

  test('Test get Projections fields with select', () => {
    const result = getProjectionFields('travel-sample', 'address, type');
    expect(result.fields).toStrictEqual(['address', 'type']);
    expect(result.projection).toBe('address, type,_type,META().id as id');
  });

  test('Test get Projections fields with array select', () => {
    const result = getProjectionFields('travel-sample', ['address', 'type']);
    expect(result.fields).toStrictEqual(['address', 'type']);
    expect(result.projection).toBe('address,type,_type,META().id as id');
  });

  test('Test get Projections fields with expression select', () => {
    const result = getProjectionFields('travel-sample', [{ $field: 'address' }, { $field: 'type' }]);
    expect(result.fields).toStrictEqual(['address', 'type']);
    expect(result.projection).toBe('`address`,`type`,_type,META().id as id');
  });

  test('Test get Projections fields with select with Query Builder', () => {
    const result = getProjectionFields('travel-sample');
    const query = new Query({}, 'travel-sample').select(result.projection).limit(10).build();
    expect(query).toBe('SELECT `travel-sample`.*,_type,META().id as id FROM `travel-sample` LIMIT 10');
  });
});
