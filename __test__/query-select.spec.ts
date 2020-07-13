import {
  connect,
  ILetExpr,
  InWithinOperatorExceptions,
  ISelectType,
  LogicalWhereExpr,
  Query,
  QueryGroupByParamsException,
  selectBuilder,
  SortType,
  WhereClauseException,
} from '../src';
import { bucketName, connectionString, password, username } from './testData';
import { IConditionExpr } from '../src/query/interface/query.types';

const testQuery = async (query: string) => {
  const conn = connect({
    bucketName,
    password,
    connectionString,
    username,
  });
  return await conn.query(query);
};

describe('Test Query Builder SELECT clause', () => {
  test('Check query builder.', async () => {
    const select: ISelectType[] = [
      {
        $raw: {
          $count: {
            $field: {
              name: 'ottoman',
            },
            as: 'odm',
          },
        },
      },
    ];
    const query = new Query({}, 'travel-sample').select(select).limit(1).build();
    expect(query).toStrictEqual('SELECT RAW COUNT(ottoman) AS odm FROM `travel-sample` LIMIT 1');
    const execute = await testQuery(query);
    expect(execute.rows).toBeDefined();
  });
  test('Check the let function of the query builder', async () => {
    const select: ISelectType[] = [
      {
        $raw: {
          $count: {
            $field: {
              name: 'amount',
            },
            as: 'odm',
            ro: '$distinct',
          },
        },
      },
    ];

    const letExpr: ILetExpr[] = [
      { key: 'amount_val', value: 10 },
      { key: 'size_val', value: 20 },
    ];
    const query = new Query({}, 'travel-sample').select(select).let(letExpr).limit(1).build();
    expect(query).toStrictEqual(
      'SELECT RAW COUNT(DISTINCT amount) AS odm FROM `travel-sample` LET amount_val=10,size_val=20 LIMIT 1',
    );
    const execute = await testQuery(query);
    expect(execute.rows).toBeDefined();
  });

  test('should build  N1QL syntax correctly if it is using an alias in FROM clause', async () => {
    const select: ISelectType[] = [
      {
        $raw: {
          $count: {
            $field: {
              name: 'amount',
            },
            as: 'odm',
            ro: '$distinct',
          },
        },
      },
    ];

    const query = new Query({}, 'travel-sample as t').select(select).limit(1).build();
    expect(query).toStrictEqual('SELECT RAW COUNT(DISTINCT amount) AS odm FROM `travel-sample` as t LIMIT 1');
    const execute = await testQuery(query);
    expect(execute.rows).toBeDefined();
  });

  test('Check the orderBy function of the query builder', async () => {
    const select: ISelectType[] = [
      {
        $raw: {
          $field: {
            name: 'travel-sample',
          },
        },
      },
    ];

    const sortExpr: Record<string, SortType> = { size: 'DESC' };
    const query = new Query({}, 'travel-sample').select(select).orderBy(sortExpr).limit(1).build();
    expect(query).toStrictEqual('SELECT RAW `travel-sample` FROM `travel-sample` ORDER BY size DESC LIMIT 1');
    const execute = await testQuery(query);
    expect(execute.rows).toBeDefined();
  });

  test('Check the limit function of the query builder', async () => {
    const select: ISelectType[] = [
      {
        $raw: {
          $field: {
            name: 'travel-sample',
          },
        },
      },
    ];

    const query = new Query({}, 'travel-sample').select(select).limit(1).build();
    expect(query).toStrictEqual('SELECT RAW `travel-sample` FROM `travel-sample` LIMIT 1');
    const execute = await testQuery(query);
    expect(execute.rows).toBeDefined();
  });

  test('Check the limit function of the query builder', async () => {
    const select: ISelectType[] = [
      {
        $raw: {
          $field: {
            name: 'travel-sample',
          },
        },
      },
    ];

    const query = new Query({}, 'travel-sample').select(select).limit(10).offset(0).build();
    expect(query).toStrictEqual('SELECT RAW `travel-sample` FROM `travel-sample` LIMIT 10 OFFSET 0');
    const execute = await testQuery(query);
    expect(execute.rows).toBeDefined();
  });

  test('Check the useKeys function of the query builder', async () => {
    const select: ISelectType[] = [
      {
        $field: {
          name: 'meta().id',
        },
      },
      {
        $field: {
          name: 'travel-sample',
        },
      },
    ];

    const query = new Query({}, 'travel-sample').select(select).useKeys(['airlineR_8093']).limit(1).build();
    expect(query).toStrictEqual(
      'SELECT meta().id,`travel-sample` FROM `travel-sample` USE KEYS ["airlineR_8093"] LIMIT 1',
    );
    const execute = await testQuery(query);
    expect(execute.rows).toBeDefined();
  });

  test('Check the exception WhereClauseException in selectBuilder', async () => {
    const run = () => selectBuilder('travel-sample', {}, [], { $not: {} });
    expect(run).toThrow(WhereClauseException);
  });

  test('Check the clause WITH with incorrect syntax', async () => {
    const run = () =>
      new Query({}, 'travel-sample')
        .index('CREATE', 'travel_sample_index')
        .on([{ name: 'address' }])
        .with({ nodes1: [] })
        .build();

    expect(run).toThrow('The WITH clause has an incorrect syntax');
  });

  test('Check the WHERE clause function of the query builder', async () => {
    const expr_where: LogicalWhereExpr = {
      $or: [{ address: { $like: '%57-59%' } }, { free_breakfast: true }],
    };

    const query = new Query({}, 'travel-sample').select().where(expr_where).limit(20).build();
    expect(query).toStrictEqual(
      'SELECT * FROM `travel-sample` WHERE (address LIKE "%57-59%" OR free_breakfast=true) LIMIT 20',
    );
    const execute = await testQuery(query);
    expect(execute.rows).toBeDefined();
  });

  test('Test all the parameters of the WHERE clause', async () => {
    const expr_where: LogicalWhereExpr = {
      $or: [
        { address: { $isNull: true } },
        { free_breakfast: { $isMissing: true } },
        { free_breakfast: { $isNotValued: true } },
        { id: { $eq: 8000 } },
        { id: { $neq: 9000 } },
        { id: { $gt: 7000 } },
        { id: { $gte: 6999 } },
        { id: { $lt: 5000 } },
        { id: { $lte: 4999 } },
      ],
      $and: [{ address: { $isNotNull: true } }, { address: { $isNotMissing: true } }, { address: { $isValued: true } }],
      $not: [
        {
          address: { $like: '%59%' },
          name: { $notLike: 'Otto%' },
          $or: [{ id: { $btw: [1, 2000] } }, { id: { $notBtw: [2001, 8000] } }],
        },
        {
          address: { $like: '%20%' },
        },
      ],
    };

    const query = new Query({}, 'travel-sample').select().where(expr_where).limit(20).build();
    expect(query).toStrictEqual(
      'SELECT * FROM `travel-sample` WHERE (address IS NULL OR free_breakfast IS MISSING OR free_breakfast IS NOT VALUED OR id=8000 OR id!=9000 OR id>7000 OR id>=6999 OR id<5000 OR id<=4999) AND (address IS NOT NULL AND address IS NOT MISSING AND address IS VALUED) AND NOT (address LIKE "%59%" AND name NOT LIKE "Otto%" AND (id BETWEEN 1 AND 2000 OR id NOT BETWEEN 2001 AND 8000) AND address LIKE "%20%") LIMIT 20',
    );
    const execute = await testQuery(query);
    expect(execute.rows).toBeDefined();
  });

  test('Check the exception WITH clause', () => {
    const run = () => new Query({}, 'travel-sample').select('*').with({ nodes: [] });
    expect(run).toThrow('The WITH clause is only available for Indexes');
  });

  test('Check Query Builder build without params', () => {
    expect(new Query({}, 'travel-sample').build()).toBe('');
  });

  test('Check collections and conditions values in query class', () => {
    const query = new Query({ select: [{ $field: 'address' }] }, 'travel-sample');

    expect(query.conditions).toStrictEqual({ select: [{ $field: 'address' }] });
    expect(query.collection).toStrictEqual('travel-sample');
  });

  test('Check the query parameters of the query builder', async () => {
    const params: IConditionExpr = {
      select: [
        {
          $count: {
            $field: {
              name: 'type',
            },
            as: 'odm',
          },
        },
      ],
      let: [
        { key: 'amount_val', value: 10 },
        { key: 'size_val', value: 20 },
      ],
      where: {
        $or: [{ price: { $gt: 'amount_val', $isNotNull: true } }, { auto: { $gt: 10 } }, { amount: 10 }],
        $and: [
          { price2: { $gt: 1.99, $isNotNull: true } },
          { $or: [{ price3: { $gt: 1.99, $isNotNull: true } }, { id: '20' }] },
        ],
      },
      groupBy: [{ expr: 'type' }],
      orderBy: { type: 'DESC' },
      limit: 5,
      offset: 1,
      use: ['airlineR_8093', 'airlineR_8094'],
    };
    const query = new Query(params, 'travel-sample').build();

    expect(query).toStrictEqual(
      'SELECT COUNT(type) AS odm FROM `travel-sample` USE KEYS ["airlineR_8093","airlineR_8094"] LET amount_val=10,size_val=20 WHERE ((price>amount_val AND price IS NOT NULL) OR auto>10 OR amount=10) AND ((price2>1.99 AND price2 IS NOT NULL) AND ((price3>1.99 AND price3 IS NOT NULL) OR id="20")) GROUP BY type ORDER BY type DESC LIMIT 5 OFFSET 1',
    );
    const execute = await testQuery(query);
    expect(execute.rows).toBeDefined();
  });

  test('Test Collection Operator', async () => {
    const where = {
      $any: {
        $expr: [{ $in: { search_expr: 'search', target_expr: 'address' } }],
        $satisfied: { address: '10' },
      },
    };
    const query = new Query('', 'travel-sample').select().where(where).limit(10).build();
    expect(query).toStrictEqual(
      'SELECT * FROM `travel-sample` WHERE ANY search IN address SATISFIES address="10" END LIMIT 10',
    );
    const execute = await testQuery(query);
    expect(execute.rows).toBeDefined();
  });

  test('Test (IN|WITHIN) Operator', async () => {
    const where = {
      $in: { search_expr: 'search', target_expr: ['address'] },
    };
    const query = new Query('', 'travel-sample').select().where(where).limit(10).build();
    expect(query).toStrictEqual('SELECT * FROM `travel-sample` WHERE search IN ["address"] LIMIT 10');
    const execute = await testQuery(query);
    expect(execute.rows).toBeDefined();
  });

  test('Test (IN|WITHIN) Operator Exception', () => {
    const where = {
      $in: { search_expr: 'search' },
    };
    const run = () => new Query('', 'travel-sample').select().where(where).limit(10).build();
    expect(run).toThrow(InWithinOperatorExceptions);
  });

  test('Test GROUP BY clause', async () => {
    const groupBy = [{ expr: 'type', as: 'sch' }];
    const having = {
      type: { $like: '%hotel%' },
    };
    const letExpr: ILetExpr[] = [
      { key: 'amount_val', value: 10 },
      { key: 'size_val', value: 20 },
    ];
    const query = new Query('', 'travel-sample')
      .select([{ $count: { $field: 'type' } }])
      .groupBy(groupBy)
      .letting(letExpr)
      .having(having)
      .limit(10)
      .build();
    expect(query).toStrictEqual(
      'SELECT COUNT(type) FROM `travel-sample` GROUP BY type AS sch LETTING amount_val=10,size_val=20 HAVING type LIKE "%hotel%" LIMIT 10',
    );
    const execute = await testQuery(query);
    expect(execute.rows).toBeDefined();
  });

  test('Test GROUP BY Exception', () => {
    const having = {
      type: { $like: '%hotel%' },
    };
    const run = () =>
      new Query('', 'travel-sample')
        .select([{ $count: { $field: 'type' } }])
        .having(having)
        .limit(10)
        .build();
    expect(run).toThrow(QueryGroupByParamsException);
  });

  test('Test String JOIN clause', () => {
    const query = new Query({}, 'beer-sample brewery');
    const result = query
      .select([{ $field: 'beer.name' }])
      .plainJoin('JOIN `beer-sample` beer ON beer.brewery_id = LOWER(REPLACE(brewery.name, " ", "_"))')
      .build();
    expect(result).toStrictEqual(
      'SELECT beer.name FROM `beer-sample` brewery JOIN `beer-sample` beer ON beer.brewery_id = LOWER(REPLACE(brewery.name, " ", "_")) ',
    );
  });
});
