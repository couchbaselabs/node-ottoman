export type SortType = 'ASC' | 'DESC';
/**
 * Result expressions of ALL | DISTINCT type.
 * */
export type ReturnResultType = '$all' | '$distinct';
/**
 * Result expressions of RAW | ELEMENT | VALUE type.
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
 * Collection Range Predicate Operator.
 * */
export type CollectionRangePredicateOperatorType = '$any' | '$every';

/**
 * Collection Deep Search Operators.
 * */
export type CollectionDeepSearchOperatorType = '$in' | '$within' | '$notIn' | '$notWithin';

/**
 * Collection SATISFIES Operator used within range predicates ( ANY / EVERY ).
 * */
export type CollectionSatisfiesOperatorType = '$satisfies';

/**
 * List of String Modifiers.
 * */
export type StringModifiersType = '$ignoreCase';

/**
 * Structure of the collection in within operator.
 *
 * @example
 * ```
 * // Using $in
 * { var: { $in: expr } }
 *
 * // Using $within
 * { var: { $within: expr } }
 *
 * @var A string that evaluates to a string representing the variable name in the ANY/EVERY loop
 * @expr A string or expression that evaluates to a string representing the array to loop through
 * ```
 * */
export type CollectionRangePredicateDeepSearchExpressionType = Record<
  string,
  { [key in Exclude<CollectionDeepSearchOperatorType, '$notIn' | '$notWithin'>]?: string | any[] }
>;

/**
 * Structure of the collection range predicate expression.
 * */
export type CollectionRangePredicateExpressionType = {
  $expr: CollectionRangePredicateDeepSearchExpressionType[];
  $satisfies: FieldWhereExpr;
};

/**
 * Structure of the collection in within operator.
 *
 * @example
 * ```
 * { $any: { $expr: [{ search:{ $in: 'address' } }], $satisfies:{ address: '10' } } }
 * ```
 * */
export type CollectionRangePredicateType = {
  [key in CollectionRangePredicateOperatorType]?: CollectionRangePredicateExpressionType;
};

/**
 * Structure of the comparison operators.
 *
 * @example
 * ```
 * { operator: value } -> e.g { $like: '%ottoman%' }
 * ```
 *
 * */
export type ComparisonWhereExpr =
  | {
      [key in
        | ComparisonEmptyOperatorType
        | ComparisonSingleOperatorType
        | ComparisonMultipleOperatorType
        | ComparisonSingleStringOperatorType]?: string | number | boolean | (number | string)[];
    }
  | { [key in CollectionDeepSearchOperatorType]?: string | any[] };

/**
 * Structure of WHERE field expression
 *
 * @example
 * ```
 * { field: { operator: value } } -> e.g { address: { $like: '%ottoman%'} } | { $or: [ { address: { $like: '%ottoman%'} }] }
 * ```
 *
 * */
export type FieldWhereExpr<T = unknown> =
  | {
      [key: string]: string | number | boolean | ComparisonWhereExpr | StringModifiersType;
    }
  | { [key in LogicalOperatorType]?: (FieldWhereExpr<T> | CollectionRangePredicateType)[] }
  | Record<any, any>;

/**
 * Structure of Logical WHERE expression
 *
 * @example
 * ```
 * { field: { operator: value } } -> e.g { $or: [{ address: { $like: '%ottoman%' } }] }
 * ```
 *
 * */
export type LogicalWhereExpr<T = any> =
  | CollectionRangePredicateType
  | { [key in LogicalOperatorType]?: (FieldWhereExpr<T> | CollectionRangePredicateType)[] }
  | FieldWhereExpr<T>;
/*
 */

/**
 * SELECT field structure
 *
 * @example
 * ```
 *  e.g { name: 'address', as: 'addr' }
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
 *  { $count: { $field: { name: 'address' }, as: 'addr' } } | { $count: { $field: 'address' } }
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
 *  { $field: { name: 'address' }, as: 'addr' }
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
 *  { $raw: { $field: { name: 'address' }, as: 'addr' } }
 * ```
 *
 * */
export type ISelectResultExprType = { [key in ResultExprType]?: ISelectAggType | ISelectFieldType };

/**
 * SELECT result expression
 *
 * @example
 * ```
 *  { $all: { $field: { name: 'address' }, as: 'addr' } }
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
 *  { $all: { $field: { name: 'address' }, as: 'addr' }, $field: 'type', $field: { name: 'count' } }
 * ```
 *
 * */
export type ISelectType = ISelectReturnResultType | ISelectResultExprType | ISelectAggType | ISelectFieldType;

/**
 * LET expression
 * */
export type LetExprType = Record<string, unknown>;

export interface IGroupBy {
  expr: string;
  as?: string;
}

/**
 * List of params to build a SELECT clause
 * */
export interface IConditionExpr {
  select?: ISelectType[] | string;
  let?: LetExprType;
  where?: LogicalWhereExpr;
  orderBy?: Record<string, SortType>;
  limit?: number;
  offset?: number;
  use?: string[];
  groupBy?: IGroupBy[];
  letting?: LetExprType;
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

/**
 * Query build options
 * */
export type QueryBuildOptionsType = {
  ignoreCase?: boolean;
};

/**
 * @ignore
 * */
export type BuildFieldClauseExprType = Record<string, string | number | boolean | ComparisonWhereExpr>;
