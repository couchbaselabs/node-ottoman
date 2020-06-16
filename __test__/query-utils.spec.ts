import { parseStringSelectExpr } from '../lib';

describe('Test Query Builder Utils', () => {
  test('Test convert select expression into Array of selection keys', async () => {
    const expr = "DISTINCT (RAW (COUNT('address') as addr, address))";

    const result = parseStringSelectExpr(expr);

    expect(result).toStrictEqual(['addr', 'address']);
  });
});
