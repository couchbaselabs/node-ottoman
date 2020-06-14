import {
  buildSelectExpr,
  buildWhereClauseExpr,
  SelectClauseException,
  buildIndexExpr,
  QueryOperatorNotFoundException,
  MultipleQueryTypesException,
  Query,
  ILetExpr,
  SortType,
} from '../lib';

describe('Test Query Types', () => {
  test('Check select clause parameter types', async () => {
    const dist = {
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
    const dist = {
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
    const conditional = [
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
    const query = new Query({}, 'travel-sample').select(conditional).build();
    expect(query).toBe('SELECT RAW COUNT(`ottoman`) AS odm FROM `travel-sample`');
  });
  test('Check query builder let function', async () => {
    const conditional = [
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
    const query = new Query({}, 'travel-sample').select(conditional).let(letExpr).build();
    expect(query).toBe(
      'SELECT RAW COUNT(DISTINCT `amount`) AS odm FROM `travel-sample` LET amount_val = 10,size_val = 20',
    );
  });

  test('Check query builder orderBy function', async () => {
    const conditional = [
      {
        $raw: {
          $field: {
            name: 'travel-sample',
          },
        },
      },
    ];

    const sortExpr: Record<string, SortType> = { size: 'DESC' };
    const query = new Query({}, 'travel-sample').select(conditional).orderBy(sortExpr).build();
    expect(query).toBe(`SELECT RAW \`travel-sample\` FROM \`travel-sample\` ORDER BY size = 'DESC'`);
  });

  test('Check query builder limit function', async () => {
    const conditional = [
      {
        $raw: {
          $field: {
            name: 'travel-sample',
          },
        },
      },
    ];

    const query = new Query({}, 'travel-sample').select(conditional).limit(1).build();
    expect(query).toBe(`SELECT RAW \`travel-sample\` FROM \`travel-sample\` LIMIT 1`);
  });

  test('Check query builder limit function', async () => {
    const conditional = [
      {
        $raw: {
          $field: {
            name: 'travel-sample',
          },
        },
      },
    ];

    const query = new Query({}, 'travel-sample').select(conditional).limit(10).offset(0).build();
    expect(query).toBe(`SELECT RAW \`travel-sample\` FROM \`travel-sample\` LIMIT 10 OFFSET 0`);
  });

  test('Check query builder useKeys function', async () => {
    const conditional = [
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

    const query = new Query({}, 'travel-sample').select(conditional).useKeys(['airlineR_8093']).build();
    expect(query).toBe(`SELECT \`meta().id\`,\`travel-sample\` FROM \`travel-sample\` USE KEYS ['airlineR_8093']`);
  });

  test('Check WHERE operator not found exception', async () => {
    const expr_where = {
      $nill: [{ address: { $like: '%57-59%' } }, { free_breakfast: true }, { free_lunch: [1] }],
    };

    const run = () => buildWhereClauseExpr('', expr_where);
    expect(run).toThrow(QueryOperatorNotFoundException);
  });

  test('Check WHERE clause parameter types', async () => {
    const where = {
      $or: [{ price: { $gt: 1.99, $isNotNull: true } }, { auto: { $gt: 10 } }, { amount: 10 }],
      $and: [
        { price2: { $gt: 1.99, $isNotNull: true } },
        { $or: [{ price3: { $gt: 1.99, $isNotNull: true } }, { id: '20' }] },
      ],
    };
    expect(buildWhereClauseExpr('', where)).toEqual(
      "((price > 1.99 AND price IS NOT NULL) OR auto > 10 OR amount = 10) AND ((price2 > 1.99 AND price2 IS NOT NULL) AND ((price3 > 1.99 AND price3 IS NOT NULL) OR id = '20'))",
    );
  });

  test('Check WHERE NOT operator', async () => {
    const where = {
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
      "(NOT (price > 1.99 AND auto > 10 AND amount = 10 AND (type = 'hotel' OR type = 'landmark' OR NOT (price = 10))) AND id = 8000)",
    );
  });

  test('Check query builder WHERE clause function', async () => {
    const expr_where = {
      $or: [{ address: { $like: '%57-59%' } }, { free_breakfast: true }],
    };

    const query = new Query({}, 'travel-sample').select().where(expr_where).limit(20).build();
    expect(query).toBe(
      `SELECT * FROM \`travel-sample\` WHERE (address LIKE '%57-59%' OR free_breakfast = true) LIMIT 20`,
    );
  });

  test('Test all Where clause parameters', async () => {
    const expr_where = {
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
      "SELECT * FROM `travel-sample` WHERE (address IS NULL OR free_breakfast IS MISSING OR free_breakfast IS NOT VALUED OR id = 8000 OR id != 9000 OR id > 7000 OR id >= 6999 OR id < 5000 OR id <= 4999) AND (address IS NOT NULL AND address IS NOT MISSING AND address IS VALUED) AND NOT (address LIKE '%59%' AND name NOT LIKE 'Otto%' AND (id BETWEEN 1 AND 2000 OR id NOT BETWEEN 2001 AND 8000) AND address LIKE '%20%') LIMIT 20",
    );
  });

  test('Check INDEX parameters clause', async () => {
    const expr_where = { 'travel-sample.callsign': { $like: '%57-59%' } };

    const on = [{ name: 'travel-sample.callsing', sort: 'ASC' }];

    const withExpr = {
      nodes: ['192.168.1.1:8078', '192.168.1.1:8079'],
      defer_build: true,
      num_replica: 2,
    };

    const index = buildIndexExpr('travel-sample', 'CREATE', 'travel_sample_id_test', on, expr_where, true, withExpr);

    expect(index).toBe(
      "CREATE INDEX `travel_sample_id_test` ON `travel-sample`(`travel-sample.callsing`['ASC']) WHERE travel-sample.callsign LIKE '%57-59%' USING GSI WITH {'nodes': ['192.168.1.1:8078','192.168.1.1:8079'],'defer_build': true,'num_replica': 2}",
    );
  });

  test('Check Query Builder INDEX clause', async () => {
    const expr_where = { 'travel-sample.callsign': { $like: '%57-59%' } };

    const on = [{ name: 'travel-sample.callsing', sort: 'ASC' }];

    const withExpr = {
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
      "CREATE INDEX `travel_sample_id_test` ON `travel-sample`(`travel-sample.callsing`['ASC']) WHERE travel-sample.callsign LIKE '%57-59%' USING GSI WITH {'nodes': ['192.168.1.1:8078','192.168.1.1:8079'],'defer_build': true,'num_replica': 2}",
    );
  });

  test('Check Multiple Query Exceptions', () => {
    const run = () => new Query({}, 'travel-sample').index('travel_index', 'CREATE').select('*');
    expect(run).toThrow(MultipleQueryTypesException);
  });

  test('Check Query Builder DROP INDEX clause', async () => {
    const query = new Query({}, 'travel-sample').index('DROP', 'travel_sample_id_test').usingGSI().build();

    expect(query).toBe('DROP INDEX `travel-sample`.`travel_sample_id_test` USING GSI');
  });
  test('Check Query Builder Query Params', async () => {
    const params = {
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
      "SELECT COUNT(`ottoman`) AS odm,MAX(`count`) FROM `collection-name` USE KEYS ['airlineR_8093','airlineR_8094'] LET amount_val = 10,size_val = 20 WHERE ((price > amount_val AND price IS NOT NULL) OR auto > 10 OR amount = 10) AND ((price2 > 1.99 AND price2 IS NOT NULL) AND ((price3 > 1.99 AND price3 IS NOT NULL) OR id = '20')) ORDER BY size = 'DESC' LIMIT 10 OFFSET 1",
    );
  });
});
