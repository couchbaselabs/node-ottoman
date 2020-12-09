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
 * List of Logical operators.
 * */
export type LogicalOperatorType = '$and' | '$or' | '$not';

/**
 * Collection Select Operator.
 * */
export type CollectionSelectOperator = '$any' | '$every';

/**
 * Collection IN and WITHIN Operators.
 * */
export type CollectionInWithinOperator = '$in' | '$within';

/**
 * List of Collection IN and WITHIN Operators.
 * */
export type CollectionSatisfiesOperator = '$satisfies';

export interface CollectionInWithinOperatorValue {
  search_expr: unknown;
  target_expr: unknown;
  $not?: boolean;
}

/**
 * Structure of the collection in within operator
 *
 * @example
 * ```
 * {$in:{search_expr: 'search', target_expr: 'address', $not: true}}
 * ```
 * */
export type CollectionInWithinOperatorType = {
  [key in CollectionInWithinOperator]?: CollectionInWithinOperatorValue;
};

/**
 * Structure of the collection expression
 *
 * */
export interface CollectionExpressionType {
  $expr: CollectionInWithinOperatorType[];
  $satisfied: FieldWhereExpr;
}
/**
 * Structure of the collection in within operator
 *
 * @example
 * ```
 * {$any: {$expr: [{$in:{search_expr: 'search', target_expr: 'address', $not: true} }], $satisfied:{address: '10'}}}
 * ```
 * */
export type CollectionSelectOperatorType = {
  [key in CollectionSelectOperator]?: CollectionExpressionType;
};

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
    | ComparisonSingleStringOperatorType]?: string | number | boolean | (number | string)[];
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
export type LogicalWhereExpr =
  | {
      [key in LogicalOperatorType]?: FieldWhereExpr[];
    }
  | {
      [key: string]: FieldWhereExpr;
    }
  | {
      [key: string]: unknown;
    }
  | CollectionSelectOperatorType
  | CollectionInWithinOperatorType;

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

export type ISelectAggType = {
  [key in AggType]?: ISelectFieldType;
};

/**
 * SELECT field expression
 *
 * @example
 * ```
 *  {$field: {name: 'address'}, as: 'addr'}
 * ```
 *
 * */
export interface ISelectFieldType {
  $field: IField | string;
  as?: string;
  ro?: ReturnResultType;
}

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

export interface IGroupBy {
  expr: string;
  as?: string;
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
  groupBy?: IGroupBy[];
  letting?: ILetExpr[];
  having?: LogicalWhereExpr;
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
