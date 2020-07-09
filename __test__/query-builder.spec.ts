import {
  buildSelectExpr,
  SelectClauseException,
  ISelectType,
  buildWhereClauseExpr,
  QueryOperatorNotFoundException,
  WhereClauseException,
  LogicalWhereExpr,
  IIndexOnParams,
  IIndexWithParams,
  buildIndexExpr,
} from '../lib';

describe('Test Query Builder functions', () => {
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

    expect(buildSelectExpr('', dist)).toStrictEqual('DISTINCT RAW COUNT(ottoman) AS odm');
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
    expect(buildWhereClauseExpr('', where)).toStrictEqual(
      '((price>1.99 AND price IS NOT NULL) OR auto>10 OR amount=10) AND ((price2>1.99 AND price2 IS NOT NULL) AND ((price3>1.99 AND price3 IS NOT NULL) OR id="20"))',
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
    expect(buildWhereClauseExpr('', where)).toStrictEqual(
      '(NOT (price>1.99 AND auto>10 AND amount=10 AND (type="hotel" OR type="landmark" OR NOT (price=10))) AND id=8000)',
    );
  });
  test('Check the parameters of the INDEX clause', async () => {
    const expr_where: LogicalWhereExpr = { 'travel-sample.callsign': { $like: '%57-59%' } };

    const on: IIndexOnParams[] = [{ name: 'travel-sample.callsing', sort: 'ASC' }];

    const withExpr: IIndexWithParams = {
      nodes: [],
      defer_build: true,
      num_replica: 0,
    };

    const index = buildIndexExpr('travel-sample', 'CREATE', 'travel_sample_id_test', on, expr_where, true, withExpr);

    expect(index).toStrictEqual(
      'CREATE INDEX `travel_sample_id_test` ON `travel-sample`(`travel-sample`.callsing["ASC"]) WHERE `travel-sample`.callsign LIKE "%57-59%" USING GSI WITH {"nodes": [],"defer_build": true,"num_replica": 0}',
    );
  });
});
