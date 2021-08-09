import {
  buildWhereClauseExpr,
  getDefaultInstance,
  LetExprType,
  LogicalWhereExpr,
  Query,
  WhereClauseException,
  Schema,
  model,
} from '../src';
import { verifyWhereObjectKey } from '../src/query/helpers/builders';
import { bucketName, startInTest } from './testData';

describe('Collection operators', () => {
  test(`-> build where clause CollectionDeepSearchOperator with array target expression`, async () => {
    const whereIn = buildWhereClauseExpr('', { country: { $in: ['United Kingdom'] } });
    const whereWithin = buildWhereClauseExpr('', { country: { $within: ['United Kingdom'] } });
    const whereNotIn = buildWhereClauseExpr('', { country: { $notIn: ['United Kingdom'] } });
    const whereNotWithin = buildWhereClauseExpr('', { country: { $notWithin: ['United Kingdom'] } });

    expect(whereIn).toBe(`country IN ["United Kingdom"]`);
    expect(whereWithin).toBe(`country WITHIN ["United Kingdom"]`);
    expect(whereNotIn).toBe(`country NOT IN ["United Kingdom"]`);
    expect(whereNotWithin).toBe(`country NOT WITHIN ["United Kingdom"]`);
  });
  test(`-> build where clause CollectionDeepSearchOperator with string target expression`, async () => {
    const whereIn = buildWhereClauseExpr('', { country: { $in: { $field: 'address' } } });
    const whereWithin = buildWhereClauseExpr('', { country: { $within: { $field: 'address' } } });
    const whereNotIn = buildWhereClauseExpr('', { country: { $notIn: { $field: 'address' } } });
    const whereNotWithin = buildWhereClauseExpr('', { country: { $notWithin: { $field: 'address' } } });

    expect(whereIn).toBe(`country IN address`);
    expect(whereWithin).toBe(`country WITHIN address`);
    expect(whereNotIn).toBe(`country NOT IN address`);
    expect(whereNotWithin).toBe(`country NOT WITHIN address`);
  });
  test(`-> build where clause CollectionRangePredicateOperator required $expr and $satisfies props`, async () => {
    const where = {
      $any: {
        $dummyExpr: [{ departure: { $in: 'schedule' } }],
        $dummySatisfies: { 'departure.day': { $gt: 0 } },
      },
    };

    expect(() => buildWhereClauseExpr('', where)).toThrowError(
      `Range predicate operator '$any' only allow required properties '$expr' and '$satisfies'. Properties ['$dummyExpr', '$dummySatisfies'] are not valid.`,
    );
  });
  test(`-> build where clause CollectionRangePredicateOperator many expression defined`, async () => {
    const where = {
      $any: {
        $expr: [{ departure: { $in: 'schedule' }, dummyExpr: { $within: [5] } }],
        $satisfies: { 'departure.day': { $gt: 0 } },
      },
    };

    expect(() => buildWhereClauseExpr('', where)).toThrowError(
      `More than one property have been defined for range predicate 'ANY' as variable name in the same IN/WITHIN expression. You should select only one of the following 'departure'|'dummyExpr'.`,
    );
  });
  test(`-> build where clause CollectionRangePredicateOperator simple`, async () => {
    // ANY basic expression
    const where1 = buildWhereClauseExpr('', {
      $any: {
        $expr: [{ departure: { $in: 'schedule' } }],
        $satisfies: { 'departure.day': { $gt: 0 } },
      },
    });

    // ANY with satisfies target IN/WITHIN value
    const where2 = buildWhereClauseExpr('', {
      $any: {
        $expr: [{ departure: { $in: 'schedule' } }],
        $satisfies: { 'departure.day': { $in: [0] } },
      },
    });

    // ANY with satisfies target literal expression value
    const where3 = buildWhereClauseExpr('', {
      $any: {
        $expr: [{ departure: { $in: 'schedule' } }],
        $satisfies: { 'departure.utc': { $gt: '03:53' } },
      },
    });

    // ANY with multiple search expression
    const where4 = buildWhereClauseExpr('', {
      $any: {
        $expr: [{ departure: { $in: 'schedule' } }, { distance: { $within: '_default' } }],
        $satisfies: { $and: [{ 'departure.utc': { $gt: '03:53' } }, { distance: { $gte: 2000 } }] },
      },
    });

    // ANY with multiple search expression with one array
    const where5 = buildWhereClauseExpr('', {
      $any: {
        $expr: [
          { departure: { $in: 'schedule' } },
          { distance: { $within: '_default' } },
          { other: { $in: ['KL', 'AZ'] } },
        ],
        $satisfies: {
          $and: [{ 'departure.utc': { $gt: '03:53' } }, { distance: { $gte: 2000 } }, { other: { $field: 'airline' } }],
        },
      },
    });

    expect(where1).toBe('ANY departure IN schedule SATISFIES departure.day>0 END');
    expect(where2).toBe('ANY departure IN schedule SATISFIES departure.day IN [0] END');
    expect(where3).toBe('ANY departure IN schedule SATISFIES departure.utc>"03:53" END');
    expect(where4).toBe(
      'ANY departure IN schedule,distance WITHIN _default SATISFIES (departure.utc>"03:53" AND distance>=2000) END',
    );
    expect(where5).toBe(
      'ANY departure IN schedule,distance WITHIN _default,other IN ["KL","AZ"] SATISFIES (departure.utc>"03:53" AND distance>=2000 AND other=airline) END',
    );
  });
  test(`-> build where clause $field option`, async () => {
    const where1 = buildWhereClauseExpr('', { other: { $field: 'address' } });
    const where2 = buildWhereClauseExpr('', { other: { $in: { $field: 'address' } } });
    const where3 = buildWhereClauseExpr('', { other: { $gt: { $field: 'address' } } });
    const where4 = buildWhereClauseExpr('', { other: { $like: { $field: 'address' } } });

    expect(where1).toBe('other=address');
    expect(where2).toBe('other IN address');
    expect(where3).toBe('other>address');
    expect(where4).toBe('other LIKE address');
  });
  test(`-> build where clause verifyWhereObjectKey`, async () => {
    ['$and', '$or', '$not', '$any', '$every', 'address', 'position'].forEach((value) =>
      expect(() => verifyWhereObjectKey({ [value]: {} })).toBeTruthy(),
    );
    ['$in', '$eq', '$like'].forEach((value) =>
      expect(() => verifyWhereObjectKey({ [value]: {} })).toThrow(WhereClauseException),
    );
  });

  /**
   * @example https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/collectionops.html#collection-op-in
   * @example https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/collectionops.html#collection-op-within
   **/
  test('-> CollectionDeepSearchOperator in Query builder', async () => {
    const where: LogicalWhereExpr = {
      type: 'airline',
      country: { $in: ['United Kingdom', 'France'] },
      [`"CORSAIR"`]: { $within: { $field: 't' } },
    };
    const query = new Query({}, `${bucketName} t`).select('name,country,id').where(where).build();

    const ottoman = getDefaultInstance();
    await startInTest(ottoman);

    const response = await ottoman.query(query);

    expect(query).toStrictEqual(
      `SELECT name,country,id FROM \`${bucketName}\` t WHERE type="airline" AND country IN ["United Kingdom","France"] AND "CORSAIR" WITHIN t`,
    );
    expect(response.rows).toStrictEqual([
      {
        country: 'France',
        id: 1908,
        name: 'Corsairfly',
      },
    ]);
  });

  /**
   * @example https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/collectionops.html#collection-op-any
   **/
  test(`-> Range predicate ANY with CollectionDeepSearchOperator ( IN | WITHIN ) in a Query builder and execution`, async () => {
    const selectExpr = 'airline,airlineid,destinationairport,distance';

    const letExpr: LetExprType = { destination: ['ATL'] };

    const whereExpr: LogicalWhereExpr = {
      type: { $eq: 'route' },
      $and: [
        { sourceairport: { $eq: 'ABQ' } },
        {
          $any: {
            $expr: [{ departure: { $in: 'schedule' } }, { other: { $within: ['KL', 'AZ'] } }],
            $satisfies: {
              $and: [{ 'departure.utc': { $gt: '03:53' } }, { other: { $field: 'airline' } }],
            },
          },
        },
        { destinationairport: { $in: { $field: 'destination' } } },
      ],
    };

    const query = new Query({}, 'travel-sample').select(selectExpr).let(letExpr).where(whereExpr).build();
    const ottoman = getDefaultInstance();
    await startInTest(ottoman);

    const response = await ottoman.query(query);

    expect(response.rows).toStrictEqual([
      {
        airline: 'AZ',
        airlineid: 'airline_596',
        destinationairport: 'ATL',
        distance: 2038.3535078909663,
      },
      {
        airline: 'KL',
        airlineid: 'airline_3090',
        destinationairport: 'ATL',
        distance: 2038.3535078909663,
      },
    ]);
  });

  /**
   * @example https://docs.couchbase.com/server/current/n1ql/n1ql-language-reference/collectionops.html#collection-op-every
   **/
  test(`-> Range predicate EVERY with CollectionDeepSearchOperator ( IN | WITHIN ) in a Query builder and execution`, async () => {
    const selectExpr = 'airline,airlineid,destinationairport,distance';

    const whereExpr: LogicalWhereExpr = {
      type: { $eq: 'route' },
      $and: [
        { airline: { $eq: 'KL' } },
        { sourceairport: { $like: 'ABQ' } },
        { destinationairport: { $in: ['ATL'] } },
        {
          $every: {
            $expr: [{ departure: { $in: 'schedule' } }],
            $satisfies: { 'departure.utc': { $gt: '00:35' } },
          },
        },
      ],
    };

    const query = new Query({}, 'travel-sample').select(selectExpr).where(whereExpr).build();
    const ottoman = getDefaultInstance();
    await startInTest(ottoman);

    const response = await ottoman.query(query);

    expect(query).toBe(
      `SELECT airline,airlineid,destinationairport,distance FROM \`travel-sample\` WHERE type="route" AND (airline="KL" AND sourceairport LIKE "ABQ" AND destinationairport IN ["ATL"] AND EVERY departure IN schedule SATISFIES departure.utc>"00:35" END)`,
    );

    expect(response.rows).toStrictEqual([
      {
        airline: 'KL',
        airlineid: 'airline_3090',
        destinationairport: 'ATL',
        distance: 2038.3535078909663,
      },
    ]);
  });

  test(`-> Using data model structure vs Query builder`, async () => {
    const airlineSchema = new Schema({
      callsign: String,
      country: String,
      iata: String,
      icao: String,
      id: Number,
      name: String,
      type: String,
    });

    const collectionName = 'airline';
    const Airline = model(collectionName, airlineSchema, { modelKey: 'type' });

    const ottoman = getDefaultInstance();
    await startInTest(ottoman);

    const response1 = await Airline.find(
      {
        type: 'airline',
        $and: [{ country: { $in: ['United Kingdom', 'France'] } }],
        callsign: { $isNotNull: true },
        $any: {
          $expr: [{ description: { $within: ['EU'] } }],
          $satisfies: { icao: { $like: { $field: '"%"||description' } } },
        },
      },
      { limit: 2, select: 'country,icao,name', lean: true },
    );
    let fromClause = `\`${bucketName}\``;
    if (!process.env.OTTOMAN_LEGACY_TEST) {
      fromClause = `\`${bucketName}\`.\`_default\`.\`${collectionName}\``;
    }
    const query = new Query({ select: 'country,icao,name' }, fromClause)
      .where({
        type: 'airline',
        $and: [{ country: { $in: ['United Kingdom', 'France'] } }],
        callsign: { $isNotNull: true },
        $any: {
          $expr: [{ description: { $within: ['EU'] } }],
          $satisfies: { icao: { $like: { $field: '"%"||description' } } },
        },
      })
      .limit(2)
      .build();
    const response2 = await ottoman.query(query);
    const response3 = await Airline.find({ $and: [{ country: { $in: 'United Kingdom' } }] });
    expect(response3.rows).toStrictEqual([]);
    expect(query).toBe(
      `SELECT country,icao,name FROM ${fromClause} WHERE type="airline" AND (country IN ["United Kingdom","France"]) AND callsign IS NOT NULL AND ANY description WITHIN ["EU"] SATISFIES icao LIKE "%"||description END LIMIT 2`,
    );
    expect(response1.rows).toStrictEqual(response2.rows);
  });
});
