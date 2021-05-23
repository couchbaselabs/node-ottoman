import {
  IConditionExpr,
  ILetExpr,
  ISelectType,
  LogicalWhereExpr,
  QueryBuildOptionsType,
  SortType,
} from './interface/query.types';

/**
 * Basic definition of Query class.
 * */
export abstract class BaseQuery {
  protected constructor(protected _conditions: IConditionExpr, protected _collection: string) {}

  abstract select(value?: ISelectType[] | string | undefined): BaseQuery;
  abstract where(value: LogicalWhereExpr): BaseQuery;
  abstract orderBy(value: Record<string, SortType>): BaseQuery;
  abstract limit(value: number): BaseQuery;
  abstract offset(value: number): BaseQuery;
  abstract let(value: [ILetExpr]): BaseQuery;
  abstract useKeys(value: [string]): BaseQuery;
  abstract build(options: QueryBuildOptionsType): string;
}
