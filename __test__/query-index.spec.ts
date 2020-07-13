import {
  LogicalWhereExpr,
  IIndexOnParams,
  IIndexWithParams,
  Query,
  MultipleQueryTypesException,
  IndexParamsOnExceptions,
  IndexParamsUsingGSIExceptions,
} from '../src';

describe('Test Query Builder INDEX clause', () => {
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

    expect(query).toStrictEqual(
      'CREATE INDEX `travel_sample_id_test` ON `travel-sample`(`travel-sample`.callsing) WHERE `travel-sample`.callsign LIKE "%57-59%" USING GSI WITH {"nodes": ["192.168.1.1:8078","192.168.1.1:8079"],"defer_build": true,"num_replica": 2}',
    );
  });

  test('Check Multiple Query Exceptions with select', () => {
    const run = () => new Query({}, 'travel-sample').index('travel_index', 'CREATE').select('*');
    expect(run).toThrow(MultipleQueryTypesException);
  });

  test('Check the DROP INDEX clause of the query builder', async () => {
    const query = new Query({}, 'travel-sample').index('DROP', 'travel_sample_id_test').usingGSI().build();

    expect(query).toStrictEqual('DROP INDEX `travel-sample`.`travel_sample_id_test` USING GSI');
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
});
