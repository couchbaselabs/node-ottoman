import {
  buildIndexExpr,
  buildSelectExpr,
  buildWhereClauseExpr,
  ILetExpr,
  IndexParamsOnExceptions,
  MultipleQueryTypesException,
  Query,
  QueryOperatorNotFoundException,
  SelectClauseException,
  SortType,
  WhereClauseException,
  IndexParamsUsingGSIExceptions,
  ISelectType,
  selectBuilder,
  LogicalWhereExpr,
  IIndexOnParams,
  IIndexWithParams,
  IConditionExpr,
} from '../lib';

describe('Test Query Types', () => {
  test('Check select clause parameter types', async () => {
    const dist: ISelectType = {
      $distinct: {
        $raw: {
          $count: {
            $field: {
              name: 'ottoman',
            },
            as: 'odm',
          },
        },
      },
    };

    expect(buildSelectExpr('', dist)).toEqual('DISTINCT RAW COUNT(`ottoman`) AS odm');
  });
  test('Verify the exception throwing, if there is an error in the SELECT expression.', async () => {
    const dist: ISelectType = {
      $raw1: {
        $count: {
          $field: {
            name: 'ottoman',
          },
          as: 'odm',
        },
      },
    };
    const run = () => buildSelectExpr('', dist);
    expect(run).toThrow(SelectClauseException);
  });

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
    const query = new Query({}, 'travel-sample').select(select).build();
    expect(query).toBe('SELECT RAW COUNT(`ottoman`) AS odm FROM `travel-sample`');
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
    const query = new Query({}, 'travel-sample').select(select).let(letExpr).build();
    expect(query).toBe('SELECT RAW COUNT(DISTINCT `amount`) AS odm FROM `travel-sample` LET amount_val=10,size_val=20');
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
    const query = new Query({}, 'travel-sample').select(select).orderBy(sortExpr).build();
    expect(query).toBe(`SELECT RAW \`travel-sample\` FROM \`travel-sample\` ORDER BY size DESC`);
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
    expect(query).toBe(`SELECT RAW \`travel-sample\` FROM \`travel-sample\` LIMIT 1`);
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
    expect(query).toBe(`SELECT RAW \`travel-sample\` FROM \`travel-sample\` LIMIT 10 OFFSET 0`);
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

    const query = new Query({}, 'travel-sample').select(select).useKeys(['airlineR_8093']).build();
    expect(query).toBe(`SELECT \`meta().id\`,\`travel-sample\` FROM \`travel-sample\` USE KEYS ['airlineR_8093']`);
  });

  test('Check the exception SelectClauseException in selectBuilder', async () => {
    const run = () => selectBuilder('travel-sample', {}, [], { $not: {} });
    expect(run).toThrow(SelectClauseException);
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

  test('Check the exception WHERE with an operator not found', async () => {
    const expr_where = {
      $nill: [{ address: { $like: '%57-59%' } }, { free_breakfast: true }, { free_lunch: [1] }],
    };

    const run = () => buildWhereClauseExpr('', expr_where);
    expect(run).toThrow(QueryOperatorNotFoundException);
  });

  test('Check the exception WHERE', async () => {
    const expr_where = {
      $not: { address: { $like: '%57-59%' }, free_breakfast: true, free_lunch: [1] },
    };

    const run = () => buildWhereClauseExpr('', expr_where);
    expect(run).toThrow(WhereClauseException);
  });

  test('Check WHERE clause parameter types', async () => {
    const where: LogicalWhereExpr = {
      $or: [{ price: { $gt: 1.99, $isNotNull: true } }, { auto: { $gt: 10 } }, { amount: 10 }],
      $and: [
        { price2: { $gt: 1.99, $isNotNull: true } },
        { $or: [{ price3: { $gt: 1.99, $isNotNull: true } }, { id: '20' }] },
      ],
    };
    expect(buildWhereClauseExpr('', where)).toEqual(
      "((price>1.99 AND price IS NOT NULL) OR auto>10 OR amount=10) AND ((price2>1.99 AND price2 IS NOT NULL) AND ((price3>1.99 AND price3 IS NOT NULL) OR id='20'))",
    );
  });

  test('Check WHERE NOT operator', async () => {
    const where: LogicalWhereExpr = {
      $and: [
        {
          $not: [
            { price: { $gt: 1.99 } },
            { auto: { $gt: 10 } },
            { amount: 10 },
            { $or: [{ type: 'hotel' }, { type: 'landmark' }, { $not: [{ price: 10 }] }] },
          ],
        },
        { id: 8000 },
      ],
    };
    expect(buildWhereClauseExpr('', where)).toEqual(
      "(NOT (price>1.99 AND auto>10 AND amount=10 AND (type='hotel' OR type='landmark' OR NOT (price=10))) AND id=8000)",
    );
  });

  test('Check the WHERE clause function of the query builder', async () => {
    const expr_where: LogicalWhereExpr = {
      $or: [{ address: { $like: '%57-59%' } }, { free_breakfast: true }],
    };

    const query = new Query({}, 'travel-sample').select().where(expr_where).limit(20).build();
    expect(query).toBe(
      `SELECT * FROM \`travel-sample\` WHERE (address LIKE '%57-59%' OR free_breakfast=true) LIMIT 20`,
    );
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
    expect(query).toBe(
      "SELECT * FROM `travel-sample` WHERE (address IS NULL OR free_breakfast IS MISSING OR free_breakfast IS NOT VALUED OR id=8000 OR id!=9000 OR id>7000 OR id>=6999 OR id<5000 OR id<=4999) AND (address IS NOT NULL AND address IS NOT MISSING AND address IS VALUED) AND NOT (address LIKE '%59%' AND name NOT LIKE 'Otto%' AND (id BETWEEN 1 AND 2000 OR id NOT BETWEEN 2001 AND 8000) AND address LIKE '%20%') LIMIT 20",
    );
  });

  test('Check the parameters of the INDEX clause', async () => {
    const expr_where: LogicalWhereExpr = { 'travel-sample.callsign': { $like: '%57-59%' } };

    const on: IIndexOnParams[] = [{ name: 'travel-sample.callsing', sort: 'ASC' }];

    const withExpr: IIndexWithParams = {
      nodes: ['192.168.1.1:8078', '192.168.1.1:8079'],
      defer_build: true,
      num_replica: 2,
    };

    const index = buildIndexExpr('travel-sample', 'CREATE', 'travel_sample_id_test', on, expr_where, true, withExpr);

    expect(index).toBe(
      "CREATE INDEX `travel_sample_id_test` ON `travel-sample`(`travel-sample.callsing`['ASC']) WHERE travel-sample.callsign LIKE '%57-59%' USING GSI WITH {'nodes': ['192.168.1.1:8078','192.168.1.1:8079'],'defer_build': true,'num_replica': 2}",
    );
  });

  test('Check the INDEX clause of the query builder', async () => {
    const expr_where: LogicalWhereExpr = { 'travel-sample.callsign': { $like: '%57-59%' } };

    const on: IIndexOnParams[] = [{ name: 'travel-sample.callsing' }];

    const withExpr: IIndexWithParams = {
      nodes: ['192.168.1.1:8078', '192.168.1.1:8079'],
      defer_build: true,
      num_replica: 2,
    };

    const query = new Query({}, 'travel-sample')
      .index('CREATE', 'travel_sample_id_test')
      .on(on)
      .where(expr_where)
      .usingGSI()
      .with(withExpr)
      .build();

    expect(query).toBe(
      "CREATE INDEX `travel_sample_id_test` ON `travel-sample`(`travel-sample.callsing`) WHERE travel-sample.callsign LIKE '%57-59%' USING GSI WITH {'nodes': ['192.168.1.1:8078','192.168.1.1:8079'],'defer_build': true,'num_replica': 2}",
    );
  });

  test('Check Multiple Query Exceptions with select', () => {
    const run = () => new Query({}, 'travel-sample').index('travel_index', 'CREATE').select('*');
    expect(run).toThrow(MultipleQueryTypesException);
  });

  test('Check the DROP INDEX clause of the query builder', async () => {
    const query = new Query({}, 'travel-sample').index('DROP', 'travel_sample_id_test').usingGSI().build();

    expect(query).toBe('DROP INDEX `travel-sample`.`travel_sample_id_test` USING GSI');
  });

  test('Check the exception Index Params On Exception', async () => {
    const run = () => new Query({}, 'travel-sample').select().on([{ name: 'test', sort: 'DESC' }]);
    expect(run).toThrow(IndexParamsOnExceptions);
  });

  test('Check the exception Invalid index name', async () => {
    const run = () => new Query({}, 'travel-sample').index('CREATE', 'index-*&');
    expect(run).toThrow(
      'Valid GSI index names can contain any of the following characters: A-Z a-z 0-9 # _, and must start with a letter, [A-Z a-z]',
    );
  });
  test('Check Multiple Query Exceptions with index', () => {
    const run = () => new Query({}, 'travel-sample').select('*').index('travel_index', 'CREATE');
    expect(run).toThrow(MultipleQueryTypesException);
  });

  test('Check the exception IndexParamsUsingGSIExceptions', () => {
    const run = () => new Query({}, 'travel-sample').select('*').usingGSI();
    expect(run).toThrow(IndexParamsUsingGSIExceptions);
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
              name: 'ottoman',
            },
            as: 'odm',
          },
        },
        {
          $max: {
            $field: 'count',
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
      orderBy: { size: 'DESC' },
      limit: 10,
      offset: 1,
      use: ['airlineR_8093', 'airlineR_8094'],
    };
    const query = new Query(params, 'collection-name').build();

    expect(query).toBe(
      "SELECT COUNT(`ottoman`) AS odm,MAX(`count`) FROM `collection-name` USE KEYS ['airlineR_8093','airlineR_8094'] LET amount_val=10,size_val=20 WHERE ((price>amount_val AND price IS NOT NULL) OR auto>10 OR amount=10) AND ((price2>1.99 AND price2 IS NOT NULL) AND ((price3>1.99 AND price3 IS NOT NULL) OR id='20')) ORDER BY size DESC LIMIT 10 OFFSET 1",
    );
  });
});
