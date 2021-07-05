import { getDefaultInstance, LetExprType, LogicalWhereExpr, Query } from '../src';
import { startInTest } from './testData';

describe('LET clause', () => {
  const selectExpr = 't1.airportname, t1.geo.lat, t1.geo.lon, t1.city, t1.type';

  const letExpr: LetExprType = {
    min_lat: 71,
    max_lat: 'ABS(t1.geo.lon)*4+1',
    place: `(SELECT RAW t2.country FROM \`travel-sample\` t2 WHERE t2.type = "landmark")`,
  };
  const whereExpr: LogicalWhereExpr = {
    $and: [
      { 't1.type': 'airport' },
      { 't1.geo.lat': { $gt: { $field: 'min_lat' } } },
      { 't1.geo.lat': { $lt: { $field: 'max_lat' } } },
      { 't1.country': { $in: { $field: 'place' } } },
    ],
  };

  /**
   * @example https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/let.html#examples_section
   **/
  test(`-> query builder with LET clause`, () => {
    const query = new Query({}, 'travel-sample t1').select(selectExpr).let(letExpr).where(whereExpr).build();

    expect(query).toBe(
      'SELECT t1.airportname, t1.geo.lat, t1.geo.lon, t1.city, t1.type FROM `travel-sample` t1 LET min_lat=71,max_lat=ABS(t1.geo.lon)*4+1,place=(SELECT RAW t2.country FROM `travel-sample` t2 WHERE t2.type = "landmark") WHERE (t1.type="airport" AND t1.geo.lat>min_lat AND t1.geo.lat<max_lat AND t1.country IN place)',
    );
  });
  test(`-> query execution with LET clause`, async () => {
    const query = new Query({}, 'travel-sample t1').select(selectExpr).let(letExpr).where(whereExpr).build();
    const ottoman = getDefaultInstance();
    await startInTest(ottoman);

    const response = await ottoman.query(query);

    expect(response.rows).toStrictEqual([
      {
        airportname: 'Wiley Post Will Rogers Mem',
        city: 'Barrow',
        lat: 71.285446,
        lon: -156.766003,
        type: 'airport',
      },
      {
        airportname: 'Dillant Hopkins Airport',
        city: 'Keene',
        lat: 72.270833,
        lon: 42.898333,
        type: 'airport',
      },
    ]);
  });
});
