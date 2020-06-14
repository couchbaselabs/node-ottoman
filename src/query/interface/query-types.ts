/**
 * Sorting types
 */
export type SortType = 'ASC' | 'DESC';
/**
 * Result expressions ALL | DISTINCT
 * */
export type ReturnResultType = '$all' | '$distinct';
/**
 * Result expressions RAW | ELEMENT | VALUE
 * */
export type ResultExprType = '$raw' | '$element' | '$value';
/**
 * List of aggregation functions.
 * */
export type AggType =
  | '$arrayAgg'
  | '$avg'
  | '$mean'
  | '$count'
  | '$countn'
  | '$max'
  | '$median'
  | '$min'
  | '$stddev'
  | '$stddevPop'
  | '$stddevSamp'
  | '$sum'
  | '$variance'
  | '$variancePop'
  | '$varianceSamp'
  | '$varPop'
  | '$varSamp';

/**
 * List of Boolean comparison operators.
 * */
export type ComparisonEmptyOperatorType =
  | '$isNull'
  | '$isNotNull'
  | '$isMissing'
  | '$isNotMissing'
  | '$isValued'
  | '$isNotValued';
/**
 * List of Numeric comparison operators.
 * */
export type ComparisonSingleOperatorType = '$eq' | '$neq' | '$gt' | '$gte' | '$lt' | '$lte';
/**
 * List of String comparison operators.
 * */
export type ComparisonSingleStringOperatorType = '$like' | '$notLike';
/**
 * List of Range comparison operators.
 * */
export type ComparisonMultipleOperatorType = '$btw' | '$notBtw';

/**
 * List of Logical operators
 * */
export type LogicalOperatorType = '$and' | '$or' | '$not';

/**
 * Structure of the comparison operators.
 *
 * @example
 * ```
 * {operator: value} -> e.g { $like: '%ottoman%'}
 * ```
 *
 * */
export type ComparisonWhereExpr = {
  [key in
    | ComparisonEmptyOperatorType
    | ComparisonSingleOperatorType
    | ComparisonMultipleOperatorType
    | ComparisonSingleStringOperatorType]?: string | number | boolean | number[];
};

/**
 * Structure of WHERE field expression
 *
 * @example
 * ```
 * {field: {operator: value}} -> e.g { address: {$like: '%ottoman%'}} | {$or: [{ address: {$like: '%ottoman%'}}]}
 * ```
 *
 * */
export type FieldWhereExpr = Record<string, string | number | boolean | ComparisonWhereExpr> | LogicalWhereExpr;

/**
 * Structure of Logical WHERE expression
 *
 * @example
 * ```
 * {field: {operator: value}} -> e.g {$or: [{ address: {$like: '%ottoman%'}}]}
 * ```
 *
 * */
export type LogicalWhereExpr = {
  [key in LogicalOperatorType]?: FieldWhereExpr[];
};

/**
 * SELECT field structure
 *
 * @example
 * ```
 *  e.g { name: 'address', as: 'addr'}
 * ```
 *
 * */
export interface IField {
  name: string;
  as?: string;
}
/**
 * SELECT aggregation expression
 *
 * @example
 * ```
 *  {$count: {$field: {name: 'address'}, as: 'addr'}} | {$count: {$field: 'address'}}
 * ```
 *
 * */
export type ISelectAggType =
  | {
      [key in AggType]?: ISelectFieldType;
    }
  | Record<'as', string>
  | Record<'ro', ReturnResultType>;

/**
 * SELECT field expression
 *
 * @example
 * ```
 *  {$field: {name: 'address'}, as: 'addr'}
 * ```
 *
 * */
export type ISelectFieldType = Record<'$field', IField | string>;

/**
 * SELECT result expression
 *
 * @example
 * ```
 *  {$raw: {$field: {name: 'address'}, as: 'addr'}}
 * ```
 *
 * */
export type ISelectResultExprType = { [key in ResultExprType]?: ISelectAggType | ISelectFieldType };

/**
 * SELECT result expression
 *
 * @example
 * ```
 *  {$all: {$field: {name: 'address'}, as: 'addr'}}
 * ```
 *
 * */
export type ISelectReturnResultType = {
  [key in ReturnResultType]?: ISelectResultExprType | ISelectAggType | ISelectFieldType;
};

/**
 * SELECT expression
 *
 * @example
 * ```
 *  {$all: {$field: {name: 'address'}, as: 'addr'}, $field: 'type', $field: {name: 'count'}}
 * ```
 *
 * */
export type ISelectType = ISelectReturnResultType | ISelectResultExprType | ISelectAggType | ISelectFieldType;

/**
 * LET expression
 * */
export interface ILetExpr {
  key: string;
  value: unknown;
}

/**
 * List of params to build a SELECT clause
 * */
export interface IConditionExpr {
  select?: ISelectType[] | string;
  let?: ILetExpr[];
  where?: LogicalWhereExpr;
  orderBy?: Record<string, SortType>;
  limit?: number;
  offset?: number;
  use?: string[];
}

/**
 * Types of supported index statements
 * */
export type IndexType = 'CREATE' | 'BUILD' | 'DROP' | 'CREATE PRIMARY';

/**
 * Index ON clause types
 * */
export interface IIndexOnParams {
  name: string;
  sort?: SortType;
}

/**
 * Index WITH clause
 * */
export interface IIndexWithParams {
  nodes?: string[];
  defer_build?: boolean;
  num_replica?: number;
}
