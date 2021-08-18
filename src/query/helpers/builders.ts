import { BuildQueryError } from '../../exceptions/ottoman-errors';
import {
  CollectionInWithinExceptions,
  QueryGroupByParamsException,
  QueryOperatorNotFoundException,
  SelectClauseException,
  WhereClauseException,
} from '../exceptions';
import {
  BuildFieldClauseExprType,
  CollectionDeepSearchOperatorType,
  CollectionRangePredicateDeepSearchExpressionType,
  CollectionRangePredicateExpressionType,
  CollectionRangePredicateOperatorType,
  ComparisonWhereExpr,
  IField,
  IGroupBy,
  IIndexOnParams,
  IIndexWithParams,
  IndexType,
  ISelectAggType,
  ISelectType,
  LetExprType,
  LogicalWhereExpr,
  SortType,
} from '../interface/query.types';
import { escapeFromClause, escapeReservedWords } from '../utils';
import {
  AggDict,
  CollectionDeepSearchOperatorDict,
  CollectionRangePredicateOperatorDict,
  CollectionSatisfiesOperatorDict,
  ComparisonEmptyOperatorDict,
  ComparisonMultipleOperatorDict,
  ComparisonSingleOperatorDict,
  ComparisonSingleStringOperatorDict,
  LogicalOperatorDict,
  ResultExprDict,
  ReturnResultDict,
} from './dictionary';

// start of SELECT expression functions
/**
 * Build a SELECT N1QL query from user-specified parameters.
 * {@link https://docs.couchbase.com/server/6.5/n1ql/n1ql-language-reference/select-syntax.html}
 * @param collection Collection name
 * @param select SELECT Clause
 * @param letExpr LET Clause
 * @param where WHERE Clause
 * @param orderBy ORDER BY Clause
 * @param limit LIMIT Clause
 * @param offset OFFSET Clause
 * @param useExpr USE Clause
 * @param groupByExpr GROUP BY Clause
 * @param lettingExpr LETTING Clause
 * @param havingExpr HAVING Clause
 * @param plainJoinExpr PLAIN JOIN string definition
 * @param ignoreCase boolean to ignore case
 *
 * @return N1QL SELECT Query
 * */
export const selectBuilder = (
  collection: string,
  select: ISelectType[] | string,
  letExpr?: LetExprType,
  where?: LogicalWhereExpr,
  orderBy?: Record<string, SortType>,
  limit?: number,
  offset?: number,
  useExpr?: string[],
  groupByExpr?: IGroupBy[],
  lettingExpr?: LetExprType,
  havingExpr?: LogicalWhereExpr,
  plainJoinExpr?: string,
  ignoreCase?: boolean,
): string => {
  try {
    let expr = '';
    if (typeof select === 'string') {
      expr = select;
    }
    if (Array.isArray(select)) {
      expr = buildSelectArrayExpr(select);
    }
    const _collection = escapeFromClause(collection);
    return `SELECT ${expr} FROM ${_collection}${plainJoinExpr ? ` ${plainJoinExpr} ` : ''}${_buildUseKeysExpr(
      useExpr,
    )}${_buildLetExpr(letExpr)}${buildWhereExpr(where, undefined, ignoreCase)}${_buildGroupByExpr(
      groupByExpr,
      lettingExpr,
      havingExpr,
    )}${_buildOrderByExpr(orderBy)}${_buildLimitExpr(limit)}${_buildOffsetExpr(offset)}`;
  } catch (exception) {
    if (exception instanceof WhereClauseException) {
      throw exception;
    }
    throw new SelectClauseException();
  }
};

/**
 * @ignore
 * */
const _buildAS = (c: ISelectAggType | IField) => {
  return c.hasOwnProperty('as') ? ` AS ${c['as']}` : '';
};

/**
 * @ignore
 * */
const _buildField = (clause: IField | string) => {
  if (clause.hasOwnProperty('name')) {
    return `${escapeReservedWords(clause['name'])}${_buildAS(clause as IField)}`;
  }
  return `${escapeReservedWords(clause as string)}`;
};

/**
 * Create N1QL queries from SELECT array params.
 * @param clause SELECT Clause
 *
 * @return N1QL SELECT Query
 * */
export const buildSelectArrayExpr = (clause: ISelectType[]): string => {
  return `${clause.map((c) => buildSelectExpr('', c)).join(',')}`;
};

/**
 * Recursive function to create N1QL queries.
 * @param n1ql N1QL Query String
 * @param clause SELECT Clause
 *
 * @return N1QL SELECT Query
 * */
export const buildSelectExpr = (n1ql: string, clause: ISelectType): string => {
  try {
    if (clause.hasOwnProperty('$field')) {
      return _buildField(clause['$field']);
    }
    const key = Object.keys(clause)[0];
    if (ReturnResultDict.hasOwnProperty(key)) {
      return `${ReturnResultDict[key]} ${buildSelectExpr(n1ql, clause[key])}`;
    }
    if (ResultExprDict.hasOwnProperty(key)) {
      return `${ResultExprDict[key]} ${buildSelectExpr(n1ql, clause[key])}`;
    }
    if (AggDict.hasOwnProperty(key)) {
      // todo: check if have AS expression inside of Agg function.
      return `${AggDict[key]}(${_buildAggDictExpr(clause as ISelectAggType, key)}${buildSelectExpr(
        n1ql,
        clause[key],
      )})${_buildAS(clause[key])}`;
    }
    throw new SelectClauseException();
  } catch {
    throw new SelectClauseException();
  }
};

/**
 * @ignore
 * */
const _buildAggDictExpr = (clause: ISelectAggType, key: string) => {
  if (AggDict.hasOwnProperty(key)) {
    if (clause[key].hasOwnProperty('ro')) {
      return `${ReturnResultDict[clause[key]['ro']]} `;
    }
  }
  return '';
};

/**
 * @ignore
 * */
const _buildLetExpr = (letExpr?: LetExprType, clause = 'LET') => {
  const entries = Object.entries(letExpr ?? {});
  return entries.length
    ? ` ${clause} ${entries
        .map(([key, value]) => {
          const parsedValue = Array.isArray(value) ? JSON.stringify(value) : value;
          return `${escapeReservedWords(key)}=${parsedValue}`;
        })
        .join(',')}`
    : '';
};

/**
 * @ignore
 * */
const _buildOrderByExpr = (orderExpr: Record<string, SortType> | undefined) => {
  return !!orderExpr
    ? ` ORDER BY ${Object.keys(orderExpr)
        .map((value: string) => `${escapeReservedWords(value)} ${orderExpr[value]}`)
        .join(',')}`
    : '';
};

/**
 * @ignore
 * */
const _buildLimitExpr = (limit: number | undefined) => {
  return Number.isInteger(limit) ? ` LIMIT ${limit}` : '';
};

/**
 * @ignore
 * */
const _buildOffsetExpr = (offset: number | undefined) => {
  return Number.isInteger(offset) ? ` OFFSET ${offset}` : '';
};

/**
 * @ignore
 * */
const _buildUseKeysExpr = (useKeys: string[] | undefined) => {
  return Array.isArray(useKeys) ? ` USE KEYS ${stringifyValues(useKeys)}` : '';
};

// end of SELECT expression functions

// start of GROUP BY expression functions
/**
 *@ignore
 */
const _buildGroupByExpr = (groupByExpr?: IGroupBy[], lettingExpr?: LetExprType, havingExpr?: LogicalWhereExpr) => {
  try {
    if ((lettingExpr || havingExpr) && !groupByExpr) {
      throw new QueryGroupByParamsException();
    }
    if (!groupByExpr) {
      return '';
    }
    return ` ${_buildGroupBy(groupByExpr)}${_buildLetExpr(lettingExpr, 'LETTING')}${buildWhereExpr(
      havingExpr as LogicalWhereExpr,
      'HAVING',
    )}`;
  } catch {
    throw new QueryGroupByParamsException();
  }
};

/**
 *@ignore
 */
const _buildGroupBy = (groupByExpr: IGroupBy[]) => {
  return `GROUP BY ${groupByExpr
    .map((value: IGroupBy) => {
      return `${escapeReservedWords(value.expr)}${value.as ? ` AS ${value.as}` : ''}`;
    })
    .join(',')}`;
};

// end of GROUP BY expression functions

// start of WHERE expression functions

/**
 * Create WHERE N1QL Expressions.
 * {@link https://docs.couchbase.com/server/6.5/n1ql/n1ql-language-reference/where.html}
 * @param clause WHERE Clause
 * @param ignoreCase Apply ignore case
 * @return N1QL WHERE Expression
 * */
export const buildWhereExpr = (expr?: LogicalWhereExpr, clause = 'WHERE', ignoreCase = false): string => {
  return expr ? ` ${clause} ${buildWhereClauseExpr('', expr, ignoreCase)}` : '';
};

/**
 * Where object keys
 * @ignore
 **/
const WHERE_OBJECT_KEYS = ['$and', '$or', '$not', '$any', '$every'];

export const verifyWhereObjectKey = (clause: LogicalWhereExpr): boolean => {
  const keys = Object.keys(clause);
  let invalid: any;
  if (
    keys.some((key) => {
      if (!WHERE_OBJECT_KEYS.includes(key) && String(key).match(/^\$.+$/) && key !== '$field') {
        invalid = { [key]: clause[key] };
        return true;
      }
      return false;
    })
  ) {
    throw new WhereClauseException(
      `For clause:\n${JSON.stringify(invalid, null, 2)}\nwe expect { EXPRESSION : { OPERATOR: EXPRESSION } }`,
    );
  }

  return keys.some((key) => WHERE_OBJECT_KEYS.includes(key));
};

/**
 * Recursive function to create WHERE N1QL expressions.
 * @param n1ql N1QL Query String
 * @param clause WHERE Clause param
 * @param ignoreCase Apply ignoreCase
 *
 * @return N1QL WHERE expression
 * */
export const buildWhereClauseExpr = (n1ql: string, clause: LogicalWhereExpr, ignoreCase = false): string => {
  try {
    if (!verifyWhereObjectKey(clause)) {
      return _buildFieldClauseExpr(clause as BuildFieldClauseExprType, ignoreCase);
    }

    return Object.keys(clause)
      .map((key) => {
        if (CollectionRangePredicateOperatorDict[key]) {
          return `${_buildWherePredicateRangeExpression(key as CollectionRangePredicateOperatorType, clause[key])}`;
        }
        if (Array.isArray(clause[key])) {
          const prefix = key === '$not' ? `${LogicalOperatorDict[key]} ` : '';
          const joinOp = key === '$not' ? ` AND ` : ` ${LogicalOperatorDict[key]} `;
          return `${prefix}(${clause[key]
            .map((value) => buildWhereClauseExpr(n1ql, value as LogicalWhereExpr, ignoreCase))
            .join(joinOp)})`;
        } else {
          return `${buildWhereClauseExpr(n1ql, { [key]: clause[key] }, ignoreCase)}`;
        }
      })
      .join(' AND ');
  } catch (exception) {
    if (exception instanceof WhereClauseException || exception instanceof TypeError) {
      throw exception;
    }
    throw new WhereClauseException();
  }
};

/**
 * @ignore
 * */
const _buildFieldClauseExpr = (field: BuildFieldClauseExprType, ignoreCase = false) => {
  try {
    const expr = Object.keys(field).map((value: string) => {
      if (typeof field[value] === 'object' && !Array.isArray(field[value]) && !field[value]?.['$field']) {
        return `${_buildComparisonClauseExpr(value, field[value] as ComparisonWhereExpr, ignoreCase)}`;
      }

      if (value === '$field') {
        return escapeReservedWords(String(field[value]));
      }

      const fieldExpr = field[value]?.['$field'];
      if (fieldExpr && typeof fieldExpr === 'string') {
        return `${escapeReservedWords(value)}=${fieldExpr}`;
      }

      if (!value.includes('$')) {
        if (typeof field[value] === 'string') {
          const comparator = escapeReservedWords(value);
          const toCompare = stringifyValues(field[value]);
          return ignoreCase
            ? applyIgnoreCase(ignoreCase, comparator, '=', toCompare, true)
            : `${comparator}=${toCompare}`;
        }
        if (typeof field[value] === 'number' || typeof field[value] === 'boolean' || Array.isArray(field[value])) {
          return `${escapeReservedWords(value)}=${stringifyValues(field[value])}`;
        }
      }
      throw new QueryOperatorNotFoundException(value);
    });
    return expr.join(' AND ');
  } catch (exception) {
    if (exception instanceof WhereClauseException || exception instanceof TypeError) {
      throw exception;
    }
    throw new WhereClauseException();
  }
};

/**
 * @ignore
 * */
const _buildComparisonClauseExpr = (fieldName: string, comparison: ComparisonWhereExpr, ignoreCase = false) => {
  try {
    let ignore = ignoreCase;
    const keys = Object.keys(comparison).filter((key) => {
      if (key === '$ignoreCase') {
        const value = comparison[key];
        if (typeof value !== 'boolean') {
          throw TypeError(`The data type of $ignoreCase must be Boolean`);
        }
        ignore = value;
        return false;
      }
      return true;
    });

    const expr = keys
      .map((key: string) => {
        const value = comparison[key];
        if (value != null) {
          const field = escapeReservedWords(fieldName);
          if (ComparisonEmptyOperatorDict.hasOwnProperty(key)) {
            return `${field} ${ComparisonEmptyOperatorDict[key]}`;
          }
          if (ComparisonSingleOperatorDict.hasOwnProperty(key)) {
            const operator = ComparisonSingleOperatorDict[key];
            const endValue = _parseEndValue(value);
            return applyIgnoreCase(ignore, field, operator, endValue, true);
          }
          if (ComparisonSingleStringOperatorDict.hasOwnProperty(key)) {
            const operator = ComparisonSingleStringOperatorDict[key];
            const endValue = _parseEndValue(value);
            return applyIgnoreCase(ignore, field, operator, endValue);
          }
          if (ComparisonMultipleOperatorDict.hasOwnProperty(key) && Array.isArray(value)) {
            return `${field} ${ComparisonMultipleOperatorDict[key]} ${value
              .map((v) => stringifyValues(v))
              .join(' AND ')}`;
          }
          if (CollectionDeepSearchOperatorDict.hasOwnProperty(key)) {
            return `${_buildCollectionInWithinOperator(key as CollectionDeepSearchOperatorType, field, value)}`;
          }
        }
        throw new QueryOperatorNotFoundException(key);
      })
      .join(` AND `);
    return Object.keys(comparison).length > 1 ? `(${expr})` : expr;
  } catch (exception) {
    if (exception instanceof WhereClauseException || exception instanceof TypeError) {
      throw exception;
    }

    throw new WhereClauseException();
  }
};

/**
 * @ignore
 * */
function _parseEndValue(value: unknown): string {
  return typeof value === 'object' && value?.['$field']
    ? escapeReservedWords(value?.['$field'])
    : stringifyValues(value);
}

/**
 * @ignore
 * */
const _buildCollectionInWithinOperator = (
  operator: CollectionDeepSearchOperatorType,
  searchExpr: string,
  targetExpr: string | any[],
  isRangePredicate = false,
): string => {
  if (!(operator in CollectionDeepSearchOperatorDict)) {
    throw new CollectionInWithinExceptions();
  }
  let target: any = targetExpr;
  switch (typeof targetExpr) {
    case 'object': {
      if (Array.isArray(target)) {
        target = JSON.stringify(target);
      } else {
        target = buildWhereClauseExpr('', target);
      }
      break;
    }
    default: {
      target = isRangePredicate ? target : stringifyValues(target);
    }
  }
  return `${searchExpr} ${CollectionDeepSearchOperatorDict[operator]} ${target}`;
};

const stringifyValues = (value: unknown) => {
  return JSON.stringify(value).replace(/\\/gi, '');
};

/**
 * @ignore
 * */
const _buildCollectionInWithinExpression = (
  collection: CollectionRangePredicateDeepSearchExpressionType,
  rangePredicate: string,
) => {
  const entries = Object.entries(collection);
  if (entries.length > 1) {
    throw new CollectionInWithinExceptions(
      `More than one property have been defined for range predicate '${rangePredicate}' as variable name in the same IN/WITHIN expression. You should select only one of the following '${Object.keys(
        collection,
      ).join(`'|'`)}'.`,
    );
  }
  const [searchExpr, inWithinExpr] = entries[0];
  const [operator, targetExpr] = Object.entries(inWithinExpr)[0];

  // TODO check if target expression is required
  return _buildCollectionInWithinOperator(
    operator as CollectionDeepSearchOperatorType,
    searchExpr,
    targetExpr as any,
    true,
  );
};
/**
 * @ignore
 * */
const _buildWherePredicateRangeExpression = (
  operator: CollectionRangePredicateOperatorType,
  rangePredicate: CollectionRangePredicateExpressionType,
) => {
  const op = CollectionRangePredicateOperatorDict[operator];
  const keys = Object.keys(rangePredicate);
  if (keys.some((key) => !['$expr', '$satisfies'].includes(key))) {
    throw new CollectionInWithinExceptions(
      `Range predicate operator '${operator}' only allow required properties '$expr' and '$satisfies'. Properties ['${keys
        .filter((key) => !['$expr', '$satisfies'].includes(key))
        .join(`', '`)}'] are not valid.`,
    );
  }
  const { $expr, $satisfies } = rangePredicate;
  return `${op} ${$expr.map((value) => _buildCollectionInWithinExpression(value, op)).join(',')} ${
    CollectionSatisfiesOperatorDict['$satisfies']
  } ${buildWhereClauseExpr('', $satisfies)} END`;
};
// end of WHERE expression functions

// start of INDEX expression functions

/**
 * Build a INDEX N1QL query from user-specified parameters.
 * {@link https://docs.couchbase.com/server/6.5/n1ql/n1ql-language-reference/createindex.html}
 * @param collection Collection name
 * @param type INDEX clause types ('CREATE' | 'BUILD' | 'DROP' | 'CREATE PRIMARY')
 * @param on ON Clause
 * @param where WHERE Clause
 * @param usingGSI use a Global Secondary Index (GSI)
 * @param withExpr WITH Clause
 *
 * @return N1QL INDEX Query
 * */
export const buildIndexExpr = (
  collection: string,
  type: IndexType,
  name: string,
  on?: IIndexOnParams[],
  where?: LogicalWhereExpr,
  usingGSI?: boolean,
  withExpr?: IIndexWithParams,
): string => {
  if (['BUILD', 'CREATE', 'CREATE PRIMARY'].includes(type) && on) {
    return `${type} INDEX \`${name}\` ON \`${collection}\`(${buildOnExpr(on)})${buildWhereExpr(where)} ${
      usingGSI ? 'USING GSI' : ''
    } ${buildWithExpr(withExpr)}`;
  } else {
    return `${type} INDEX \`${collection}\`.\`${name}\`${usingGSI ? ' USING GSI' : ''}`;
  }
};

/**
 * @ignore
 * */
const buildOnExpr = (on: IIndexOnParams[]) => {
  return on
    .map((value: IIndexOnParams) => {
      return `${escapeReservedWords(value.name)}${buildOnSortExpr(value)}`;
    })
    .join(',');
};

/**
 * @ignore
 * */
const buildOnSortExpr = (onExpr?: IIndexOnParams) => {
  if (onExpr && onExpr.hasOwnProperty('sort')) {
    return `["${onExpr.sort}"]`;
  }
  return '';
};

/**
 * @ignore
 * */
const buildWithExpr = (withExpr?: IIndexWithParams) => {
  let expr = '';
  if (withExpr) {
    const resultExpr = Object.keys(withExpr)
      .map((value: string) => {
        switch (value) {
          case 'nodes':
            return buildWithNodesExpr(withExpr[value]);
          case 'defer_build':
          case 'num_replica':
            return `"${value}": ${withExpr[value]}`;
          default:
            throw new BuildQueryError('The WITH clause has an incorrect syntax');
        }
      })
      .join(',');
    expr = !!resultExpr ? `WITH {${resultExpr}}` : '';
  }
  return expr;
};

/**
 * @ignore
 * */
const buildWithNodesExpr = (withNodesExpr?: string[]) => {
  if (withNodesExpr) {
    return `"nodes": ${stringifyValues(withNodesExpr)}`;
  }
};

/**
 * @ignore
 * */
const applyIgnoreCase = (
  isIgnoreCase: boolean,
  left: string,
  operator: string,
  right: string,
  ignoreSpace?: boolean,
) => {
  const op = ignoreSpace ? `${operator}` : ` ${operator} `;
  return isIgnoreCase ? `LOWER(${left}) ${operator} LOWER(${right})` : `${left}${op}${right}`;
};

// end of INDEX expression functions
