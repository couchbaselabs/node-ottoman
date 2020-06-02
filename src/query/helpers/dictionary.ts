import {
  AggType,
  ComparisonEmptyOperatorType,
  ComparisonMultipleOperatorType,
  ComparisonSingleOperatorType,
  ComparisonSingleStringOperatorType,
  LogicalOperatorType,
  ResultExprType,
  ReturnResultType,
} from '../interface';

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

export const ResultExprDict: Record<ResultExprType, string> = { $raw: 'RAW', $element: 'ELEMENT', $value: 'VALUE' };

export const ReturnResultDict: Record<ReturnResultType, string> = { $all: 'ALL', $distinct: 'DISTINCT' };

export const ComparisonEmptyOperatorDict: Record<ComparisonEmptyOperatorType, string> = {
  $isNull: 'IS NULL',
  $isNotNull: 'IS NOT NULL',
  $isMissing: 'IS MISSING',
  $isNotMissing: 'IS NOT MISSING',
  $isValued: 'IS VALUED',
  $isNotValued: 'IS NOT VALUED',
};

export const ComparisonSingleOperatorDict: Record<ComparisonSingleOperatorType, string> = {
  $eq: '=',
  $neq: '!=',
  $gt: '>',
  $gte: '>=',
  $lt: '<',
  $lte: '<=',
};

export const ComparisonSingleStringOperatorDict: Record<ComparisonSingleStringOperatorType, string> = {
  $like: 'LIKE',
  $notLike: 'NOT LIKE',
};

export const ComparisonMultipleOperatorDict: Record<ComparisonMultipleOperatorType, string> = {
  $btw: 'BETWEEN',
  $notBtw: 'NOT BETWEEN',
};

export const LogicalOperatorDict: Record<LogicalOperatorType, string> = {
  $and: 'AND',
  $or: 'OR',
  $not: 'NOT',
};
