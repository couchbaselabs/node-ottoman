import { BaseQuery } from './base-query';
import {
  IConditionExpr,
  IIndexOnParams,
  IIndexWithParams,
  ILetExpr,
  IndexType,
  ISelectType,
  LogicalWhereExpr,
  SortType,
} from './interface/query-types';
import {
  IndexParamsOnExceptions,
  IndexQueryException,
  MultipleQueryTypesException,
  SelectQueryException,
} from './exceptions';
import { buildIndexExpr, selectBuilder } from './helpers';

export class Query extends BaseQuery {
  /**
   * SELECT Expression.
   */
  private selectExpr?: ISelectType[] | string;
  /**
   * WHERE Expression.
   */
  private whereExpr?: LogicalWhereExpr;
  /**
   * ORDER BY Expression.
   */
  private orderExpr?: Record<string, SortType>;
  /**
   * LIMIT Expression.
   */
  private limitExpr?: number;
  /**
   * OFFSET Expression.
   */
  private offSetExpr?: number;
  /**
   * LET Expression.
   */
  private letExpr?: ILetExpr[];
  /**
   * USE Expression.
   */
  private useKeysExpr?: string[];
  /**
   * Available query types.
   */
  private queryType?: 'SELECT' | 'INDEX';
  /**
   * INDEX ON Expression.
   */
  private indexOn?: IIndexOnParams[];
  /**
   * Types of supported index statements.
   */
  private indexType?: IndexType;
  /**
   * Index name.
   */
  private indexName?: string;
  /**
   * INDEX USING GSI Expression.
   */
  private indexUsingGSI?: boolean;
  /**
   * INDEX USING GSI Expression.
   */
  private indexWith?: IIndexWithParams;
  /**
   * @summary Create an instance of Query.
   * @name Query
   * @class
   * @public
   *
   * @param conditions List of SELECT clause conditions
   * @param collection Collection name
   * @returns Query
   *
   * @example
   * ```ts
   *  const query = new Query({$select: [{$field: 'address'}], $where: {$nill: [{ address: { $like: '%57-59%' } }, { free_breakfast: true }, { free_lunch: [1] }]}}, 'travel-sample');
   * ```
   */
  constructor(conditions: IConditionExpr, collection: string) {
    super(conditions, collection);
    if (conditions) {
      this.compileFromConditions(conditions);
    }
  }

  /**
   * Add result selectors to SELECT clause.
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const query = new Query({}, 'travel-sample');
   *   const result = query.select([{$field: 'address'}]).build()
   *   console.log(result)
   * ```
   * > SELECT address FROM `travel-sample`
   */
  select(value?: ISelectType[] | string | undefined): Query {
    if (this.queryType === undefined || this.queryType === 'SELECT') {
      this.queryType = 'SELECT';
      if (!value) {
        this.selectExpr = '*';
      }
      if (typeof value === 'string') {
        this.selectExpr = value;
      }
      if (typeof value === 'object') {
        this.selectExpr = [...(this.selectExpr || []), ...value] as ISelectType[];
      }

      return this;
    }
    throw new MultipleQueryTypesException('SELECT', this.queryType);
  }

  /**
   * Add index type and name to INDEX clause.
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const result = new Query({}, 'travel-sample').index('DROP', 'travel_sample_id_test').build();
   *   console.log(result)
   * ```
   * > DROP INDEX `travel-sample`.`travel_sample_id_test`
   */
  index(type: IndexType, name: string): Query {
    if (this.queryType === undefined) {
      if (name.search(/^[A-Za-z][A-Za-z0-9#_]*$/g) === -1) {
        throw new Error(
          'Valid GSI index names can contain any of the following characters: A-Z a-z 0-9 # _, and must start with a letter, [A-Z a-z]',
        );
      }
      this.queryType = 'INDEX';
      this.indexType = type;
      this.indexName = name;
      return this;
    }
    throw new MultipleQueryTypesException('INDEX', this.queryType);
  }

  /**
   * Add items to ON clause in INDEX clause.
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const on = [{ name: 'travel-sample.callsing', sort: 'ASC' }];
   *   const result = new Query({}, 'travel-sample').index('CREATE', 'travel_sample_id_test').on(on).build();
   *   console.log(result)
   * ```
   * > CREATE INDEX `travel_sample_id_test` ON `travel-sample`(`travel-sample.callsing`['ASC'])
   */
  on(value: IIndexOnParams[]): Query {
    if (this.queryType === 'INDEX' && ['CREATE', 'CREATE PRIMARY', 'BUILD'].includes(this.indexType || '')) {
      this.indexOn = value;
      return this;
    }
    throw new IndexParamsOnExceptions(['CREATE', 'CREATE PRIMARY', 'BUILD']);
  }

  /**
   * Create INDEX using General Secondary Index(GSI).
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const result = new Query({}, 'travel-sample').index('CREATE', 'travel_sample_id_test').usingGSI().build();
   *   console.log(result)
   * ```
   * > CREATE INDEX `travel_sample_id_test` USING GSI)
   */
  usingGSI(): Query {
    if (this.queryType === 'INDEX') {
      this.indexUsingGSI = true;
      return this;
    }
    throw new IndexParamsOnExceptions(['CREATE', 'CREATE PRIMARY', 'BUILD']);
  }

  /**
   * Add items to WITH clause in INDEX clause.
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const withExpr = {nodes: ['192.168.1.1:8078'],defer_build: true,num_replica: 2};
   *   const result = new Query({}, 'travel-sample').index('CREATE', 'travel_sample_id_test').with(withExpr).build();
   *   console.log(result)
   * ```
   * > CREATE INDEX `travel_sample_id_test` WITH {'nodes': ['192.168.1.1:8078'],'defer_build': true,'num_replica': 2})
   */
  with(value: IIndexWithParams): Query {
    if (this.queryType === 'INDEX') {
      this.indexWith = value;
      return this;
    }
    throw new Error('The WITH clause is only available for Indexes');
  }

  /**
   * Add WHERE expression to SELECT clause.
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const expr_where = {$or: [{ address: { $like: '%57-59%' } }, { free_breakfast: true }]};
   *   const query = new Query({}, 'travel-sample');
   *   const result = query.select([{$field: 'address'}]).where(expr_where).build()
   *   console.log(result)
   * ```
   * > SELECT address FROM `travel-sample WHERE (address LIKE '%57-59%' OR free_breakfast = true)`
   */
  where(value: LogicalWhereExpr): Query {
    this.whereExpr = value;
    return this;
  }

  /**
   * Add ORDER BY expression to SELECT clause.
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const query = new Query({}, 'travel-sample');
   *   const result = query.select([{$field: 'address'}]).orderBy({ size: 'DESC' }).build()
   *   console.log(result)
   * ```
   * > SELECT address FROM `travel-sample ORDER BY size = 'DESC'`
   */
  orderBy(value: Record<string, SortType>): Query {
    this.orderExpr = value;
    return this;
  }

  /**
   * Add LIMIT expression to SELECT clause.
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const query = new Query({}, 'travel-sample');
   *   const result = query.select([{$field: 'address'}]).limit(10).build()
   *   console.log(result)
   * ```
   * > SELECT address FROM `travel-sample LIMIT 10`
   */
  limit(value: number): Query {
    this.limitExpr = value;
    return this;
  }

  /**
   * Add OFFSET expression to SELECT clause.
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const query = new Query({}, 'travel-sample');
   *   const result = query.select([{$field: 'address'}]).offset(10).build()
   *   console.log(result)
   * ```
   * > SELECT address FROM `travel-sample OFFSET 10`
   */
  offset(value: number): Query {
    this.offSetExpr = value;
    return this;
  }

  /**
   * Add LET expression to SELECT clause.
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const letExpr = [{ key: 'amount_val', value: 10 }];
   *   const query = new Query({}, 'travel-sample');
   *   const result = query.select([{$field: 'address'}]).let(letExpr).build()
   *   console.log(result)
   * ```
   * > SELECT address FROM `travel-sample LET amount_val = 10`
   */
  let(value: ILetExpr[]): Query {
    this.letExpr = value;
    return this;
  }

  /**
   * Add USE KEYS expression to SELECT clause.
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const query = new Query({}, 'travel-sample');
   *   const result = query.select([{$field: 'address'}]).useKeys(['airlineR_8093']).build()
   *   console.log(result)
   * ```
   * > SELECT address FROM `travel-sample USE KEYS ['airlineR_8093']`
   */
  useKeys(value: string[]): Query {
    this.useKeysExpr = value;
    return this;
  }

  /**
   * Converts the conditionals parameters passed to the constructor to the properties of the N1QL Query.
   * @method
   * @public
   *
   */
  compileFromConditions(conditionals: IConditionExpr): void {
    Object.keys(conditionals).forEach((value: string) => {
      switch (value) {
        case 'select':
          this.select(conditionals[value]);
          break;
        case 'let':
          !!conditionals[value] && this.let(conditionals[value] as [ILetExpr]);
          break;
        case 'where':
          !!conditionals[value] && this.where(conditionals[value] as LogicalWhereExpr);
          break;
        case 'orderBy':
          !!conditionals[value] && this.orderBy(conditionals[value] as Record<string, SortType>);
          break;
        case 'limit':
          !!conditionals[value] && this.limit(conditionals[value] as number);
          break;
        case 'offset':
          !!conditionals[value] && this.offset(conditionals[value] as number);
          break;
        case 'use':
          !!conditionals[value] && this.useKeys(conditionals[value] as string[]);
          break;
      }
    });
  }

  /**
   * Build a n1ql query from the defined parameters.
   * @method
   * @public
   *
   */
  build(): string {
    switch (this.queryType) {
      case 'INDEX':
        switch (this.indexType) {
          case 'BUILD':
          case 'CREATE':
          case 'CREATE PRIMARY':
            if (this.indexOn) {
              return buildIndexExpr(
                this.collection,
                this.indexType,
                this.indexName || '',
                this.indexOn,
                this.whereExpr,
                this.indexUsingGSI,
                this.indexWith,
              );
            }
          case 'DROP':
            return buildIndexExpr(
              this.collection,
              this.indexType,
              this.indexName || '',
              undefined,
              undefined,
              this.indexUsingGSI,
            );
        }

        throw new IndexQueryException();
      case 'SELECT':
        if (this.selectExpr) {
          return selectBuilder(
            this.collection,
            this.selectExpr,
            this.letExpr,
            this.whereExpr,
            this.orderExpr,
            this.limitExpr,
            this.offSetExpr,
            this.useKeysExpr,
          );
        }
        throw new SelectQueryException();
    }
    return '';
  }

  get conditions(): IConditionExpr {
    return this._conditions;
  }

  set conditions(value: IConditionExpr) {
    this._conditions = value;
  }

  get collection(): string {
    return this._collection;
  }

  set collection(value: string) {
    this._collection = value;
  }
}
