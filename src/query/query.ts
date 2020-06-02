import { BaseQuery } from './base-query';
import { IConditionExpr, ILetExpr, ISelectType, LogicalWhereExpr, SortType } from './interface/query-types';
import {
  IndexQueryException,
  MultipleQueryTypesException,
  SelectClauseException,
  SelectQueryException,
} from './exceptions';
import { selectBuilder } from './helpers';

export class Query extends BaseQuery {
  private selectExpr?: ISelectType[] | string;
  private whereExpr?: LogicalWhereExpr;
  private orderExpr?: Record<string, SortType>;
  private limitExpr?: number;
  private offSetExpr?: number;
  private letExpr?: ILetExpr[];
  private useKeysExpr?: string[];
  private queryType?: 'SELECT' | 'INDEX';
  private indexExpr?: string;
  private indexOnExpr?: string;
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

  index(type: 'CREATE' | 'DROP' | 'CREATE PRIMARY', name: string): Query {
    if (this.queryType === undefined) {
      this.queryType = 'INDEX';
      this.indexExpr = `${type} INDEX ${name} `;
      return this;
    }
    throw new MultipleQueryTypesException('INDEX', this.queryType);
  }

  on(value: string): Query {
    if (this.queryType === 'INDEX') {
      this.indexOnExpr = `ON ${value}`;
      return this;
    }
    // todo create exception class
    throw new Error('todo');
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
        if (this.indexExpr && this.indexOnExpr) {
          return `${this.indexExpr}${this.indexOnExpr}`;
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
