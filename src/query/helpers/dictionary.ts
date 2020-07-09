import {
  AggType,
  CollectionSelectOperator,
  CollectionInWithinOperator,
  ComparisonEmptyOperatorType,
  ComparisonMultipleOperatorType,
  ComparisonSingleOperatorType,
  ComparisonSingleStringOperatorType,
  LogicalOperatorType,
  ResultExprType,
  ReturnResultType,
  CollectionSatisfiesOperator,
} from '../interface/query.types';

/**
 * Dictionary for handling aggregation functions.
 * */
export const AggDict: Record<AggType, string> = {
  $arrayAgg: 'ARRAY_AGG',
  $avg: 'AVG',
  $mean: 'MEAN',
  $count: 'COUNT',
  $countn: 'COUNTN',
  $max: 'MAX',
  $median: 'MEDIAN',
  $min: 'MIN',
  $stddev: 'STDDEV',
  $stddevPop: 'STDDEV_POP',
  $stddevSamp: 'STDDEV_SAMP',
  $sum: 'SUM',
  $variance: 'VARIANCE',
  $variancePop: 'VARIANCE_POP',
  $varianceSamp: 'VARIANCE_SAMP',
  $varPop: 'VAR_POP',
  $varSamp: 'VAR_SAMP',
};

/**
 * Dictionary for handling result expressions RAW | ELEMENT | VALUE
 * */
export const ResultExprDict: Record<ResultExprType, string> = { $raw: 'RAW', $element: 'ELEMENT', $value: 'VALUE' };

/**
 * Dictionary for handling result expressions ALL | DISTINCT
 * */
export const ReturnResultDict: Record<ReturnResultType, string> = { $all: 'ALL', $distinct: 'DISTINCT' };

/**
 * Dictionary for handling Boolean comparison operators
 * */
export const ComparisonEmptyOperatorDict: Record<ComparisonEmptyOperatorType, string> = {
  $isNull: 'IS NULL',
  $isNotNull: 'IS NOT NULL',
  $isMissing: 'IS MISSING',
  $isNotMissing: 'IS NOT MISSING',
  $isValued: 'IS VALUED',
  $isNotValued: 'IS NOT VALUED',
};

/**
 * Dictionary for handling Numeric comparison operators
 * */
export const ComparisonSingleOperatorDict: Record<ComparisonSingleOperatorType, string> = {
  $eq: '=',
  $neq: '!=',
  $gt: '>',
  $gte: '>=',
  $lt: '<',
  $lte: '<=',
};

/**
 * Dictionary for handling String comparison operators
 * */
export const ComparisonSingleStringOperatorDict: Record<ComparisonSingleStringOperatorType, string> = {
  $like: 'LIKE',
  $notLike: 'NOT LIKE',
};

/**
 * Dictionary for handling Range comparison operators
 * */
export const ComparisonMultipleOperatorDict: Record<ComparisonMultipleOperatorType, string> = {
  $btw: 'BETWEEN',
  $notBtw: 'NOT BETWEEN',
};

/**
 * Dictionary for handling logical operators
 * */
export const LogicalOperatorDict: Record<LogicalOperatorType, string> = {
  $and: 'AND',
  $or: 'OR',
  $not: 'NOT',
};

/**
 * Dictionary for handling collection select operators
 * */
export const CollectionSelectOperatorDict: Record<CollectionSelectOperator, string> = {
  $any: 'ANY',
  $every: 'EVERY',
};

/**
 * Dictionary for handling collection (in | within) operators
 * */
export const CollectionInWithinOperatorDict: Record<CollectionInWithinOperator, string> = {
  $in: 'IN',
  $within: 'WITHIN',
};

/**
 * Dictionary for handling collection satisfies operators
 * */
export const CollectionSatisfiesOperatorDict: Record<CollectionSatisfiesOperator, string> = {
  $satisfies: 'SATISFIES',
};
