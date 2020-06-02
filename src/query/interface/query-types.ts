export type SortType = 'ASC' | 'DESC';
export type ReturnResultType = '$all' | '$distinct';
export type ResultExprType = '$raw' | '$element' | '$value';
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

export type ComparisonEmptyOperatorType =
  | '$isNull'
  | '$isNotNull'
  | '$isMissing'
  | '$isNotMissing'
  | '$isValued'
  | '$isNotValued';

export type ComparisonSingleOperatorType = '$eq' | '$neq' | '$gt' | '$gte' | '$lt' | '$lte';

export type ComparisonSingleStringOperatorType = '$like' | '$notLike';

export type ComparisonMultipleOperatorType = '$btw' | '$notBtw';

export type LogicalOperatorType = '$and' | '$or' | '$not';

export type ComparisonWhereExpr = {
  [key in
    | ComparisonEmptyOperatorType
    | ComparisonSingleOperatorType
    | ComparisonMultipleOperatorType
    | ComparisonSingleStringOperatorType]?: string | number | boolean | number[];
};

export type FieldWhereExpr = Record<string, string | number | boolean | ComparisonWhereExpr> | LogicalWhereExpr;
export type LogicalWhereExpr = {
  [key in LogicalOperatorType]?: FieldWhereExpr[];
};

export interface IField {
  name: string;
  as?: string;
}

export type ISelectAggType =
  | {
      [key in AggType]?: ISelectFieldType;
    }
  | Record<'as', string>
  | Record<'ro', ReturnResultType>;

export type ISelectFieldType = Record<'$field', IField | string>;

export type ISelectResultExprType = { [key in ResultExprType]?: ISelectAggType | ISelectFieldType };

export type ISelectReturnResultType = {
  [key in ReturnResultType]?: ISelectResultExprType | ISelectAggType | ISelectFieldType;
};

export type ISelectType = ISelectReturnResultType | ISelectResultExprType | ISelectAggType | ISelectFieldType;

export interface ILetExpr {
  key: string;
  value: unknown;
}

export interface IConditionExpr {
  $select?: ISelectType[];
  $let?: ILetExpr[];
  $where?: LogicalWhereExpr;
  $orderBy?: Record<string, SortType>;
  $limit?: number;
  $offset?: number;
  $use?: string[];
}
