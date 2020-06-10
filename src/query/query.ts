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
  private selectExpr?: ISelectType[] | string;
  private whereExpr?: LogicalWhereExpr;
  private orderExpr?: Record<string, SortType>;
  private limitExpr?: number;
  private offSetExpr?: number;
  private letExpr?: ILetExpr[];
  private useKeysExpr?: string[];
  private queryType?: 'SELECT' | 'INDEX';
  private indexOn?: IIndexOnParams[];
  private indexType?: IndexType;
  private indexName?: string;
  private indexUsingGSI?: boolean;
  private indexWith?: IIndexWithParams;
  constructor(conditions: IConditionExpr, collection: string, model?: any) {
    super(conditions, collection, model);
    this.compileFromConditions(conditions);
  }

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

  on(value: IIndexOnParams[]): Query {
    if (this.queryType === 'INDEX' && ['CREATE', 'CREATE PRIMARY', 'BUILD'].includes(this.indexType || '')) {
      this.indexOn = value;
      return this;
    }
    throw new IndexParamsOnExceptions(['CREATE', 'CREATE PRIMARY', 'BUILD']);
  }

  usingGSI(): Query {
    if (this.queryType === 'INDEX') {
      this.indexUsingGSI = true;
      return this;
    }
    throw new IndexParamsOnExceptions(['CREATE', 'CREATE PRIMARY', 'BUILD']);
  }

  with(value: IIndexWithParams): Query {
    if (this.queryType === 'INDEX') {
      this.indexWith = value;
      return this;
    }
    throw new Error('The WITH clause is only available for Indexes');
  }

  where(value: LogicalWhereExpr): Query {
    this.whereExpr = value;
    return this;
  }

  orderBy(value: Record<string, SortType>): Query {
    this.orderExpr = value;
    return this;
  }

  limit(value: number): Query {
    this.limitExpr = value;
    return this;
  }

  offset(value: number): Query {
    this.offSetExpr = value;
    return this;
  }

  let(value: ILetExpr[]): Query {
    this.letExpr = value;
    return this;
  }

  useKeys(value: string[]): Query {
    this.useKeysExpr = value;
    return this;
  }

  compileFromConditions(conditionals: IConditionExpr): void {
    Object.keys(conditionals).forEach((value: string) => {
      switch (value) {
        case '$select':
          this.select(conditionals[value]);
          break;
        case '$let':
          !!conditionals[value] && this.let(conditionals[value] as [ILetExpr]);
          break;
        case '$where':
          !!conditionals[value] && this.where(conditionals[value] as LogicalWhereExpr);
          break;
        case '$orderBy':
          !!conditionals[value] && this.orderBy(conditionals[value] as Record<string, SortType>);
          break;
        case '$limit':
          !!conditionals[value] && this.limit(conditionals[value] as number);
          break;
        case '$offset':
          !!conditionals[value] && this.offset(conditionals[value] as number);
          break;
        case '$use':
          !!conditionals[value] && this.useKeys(conditionals[value] as string[]);
          break;
      }
    });
  }

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

  get model(): any {
    return this._model;
  }

  set model(value: any) {
    this._model = value;
  }
}
