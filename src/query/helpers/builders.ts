import {
  CollectionExpressionType,
  CollectionInWithinOperator,
  CollectionInWithinOperatorType,
  CollectionInWithinOperatorValue,
  CollectionSelectOperator,
  ComparisonWhereExpr,
  IField,
  IGroupBy,
  IIndexOnParams,
  IIndexWithParams,
  ILetExpr,
  IndexType,
  ISelectAggType,
  ISelectType,
  LogicalWhereExpr,
  SortType,
} from '../interface/query.types';
import {
  AggDict,
  CollectionInWithinOperatorDict,
  CollectionSatisfiesOperatorDict,
  CollectionSelectOperatorDict,
  ComparisonEmptyOperatorDict,
  ComparisonMultipleOperatorDict,
  ComparisonSingleOperatorDict,
  ComparisonSingleStringOperatorDict,
  LogicalOperatorDict,
  ResultExprDict,
  ReturnResultDict,
} from './dictionary';
import {
  InWithinOperatorExceptions,
  QueryGroupByParamsException,
  QueryOperatorNotFoundException,
  SelectClauseException,
  WhereClauseException,
} from '../exceptions';
import { escapeReservedWords } from '../utils';

// select expressions functions
/**
 * Build a SELECT N1QL query from user-specified parameters.
 * {@link https://docs.couchbase.com/server/6.5/n1ql/n1ql-language-reference/select-syntax.html}
 * @param collection Collection name
 * @param select SELECT Clause param
 * @param letExpr LET Clause param
 * @param where WHERE Clause param
 * @param orderBy ORDER BY Clause param
 * @param limit LIMIT Clause param
 * @param offset OFFSET Clause param
 * @param useExpr USE Clause param
 *
 * @return N1QL SELECT Query
 * */
export const selectBuilder = (
  collection: string,
  select: ISelectType[] | string,
  letExpr?: ILetExpr[],
  where?: LogicalWhereExpr,
  orderBy?: Record<string, SortType>,
  limit?: number,
  offset?: number,
  useExpr?: string[],
  groupByExpr?: IGroupBy[],
  lettingExpr?: ILetExpr[],
  havingExpr?: LogicalWhereExpr,
  plainJoinExpr?: string,
): string => {
  try {
    let expr = '';
    if (typeof select === 'string') {
      expr = select;
    }
    if (Array.isArray(select)) {
      expr = buildSelectArrayExpr(select);
    }
    const _collection =
      collection.indexOf(' ') !== -1
        ? `\`${collection}`.replace(' ', '` ')
        : collection.indexOf('`') !== -1
        ? collection
        : `\`${collection}\``;
    return `SELECT ${expr} FROM ${_collection}${plainJoinExpr ? ` ${plainJoinExpr} ` : ''}${_buildUseKeysExpr(
      useExpr,
    )}${_buildLetExpr(letExpr)}${buildWhereExpr(where)}${_buildGroupByExpr(
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
 * Create N1QL queries from select array params
 * @param clause SELECT Clause param
 *
 * @return N1QL SELECT Query
 * */
export const buildSelectArrayExpr = (clause: ISelectType[]): string => {
  return `${clause.map((c) => buildSelectExpr('', c)).join(',')}`;
};

/**
 * Recursive function to create N1QL queries.
 * @param n1ql N1QL Query String
 * @param clause SELECT Clause param
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
      // todo check if have AS expr inside of Agg function.
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
const _buildLetExpr = (letExpr: ILetExpr[] | undefined, clause?: string) => {
  return Array.isArray(letExpr)
    ? ` ${clause ? clause : 'LET'} ${letExpr
        .map((value: ILetExpr) => `${escapeReservedWords(value.key)}=${value.value}`)
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

// end select expression functions

//group by expression functions
/**
 *@ignore
 */
const _buildGroupByExpr = (groupByExpr?: IGroupBy[], lettingExpr?: ILetExpr[], havingExpr?: LogicalWhereExpr) => {
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

//end group by expression functions

// where expression functions

/**
 * Create WHERE N1QL Expressions.
 * {@link https://docs.couchbase.com/server/6.5/n1ql/n1ql-language-reference/where.html}
 * @param clause WHERE Clause param
 * @return N1QL WHERE Expression
 * */
export const buildWhereExpr = (expr: LogicalWhereExpr | undefined, clause?: string): string => {
  return expr ? ` ${clause ? clause : 'WHERE'} ${buildWhereClauseExpr('', expr)}` : '';
};

/**
 * @ignore
 *
 **/
export const verifyWhereObjectKey = (clause: LogicalWhereExpr) => {
  let exist = false;
  for (const key in clause) {
    if (['$and', '$or', '$not', '$any', '$$every', '$in', '$within'].includes(key)) {
      exist = true;
      break;
    }
  }
  return exist;
};

/**
 * Recursive function to create WHERE N1QL Expressions.
 * @param n1ql N1QL Query String
 * @param clause WHERE Clause param
 *
 * @return N1QL WHERE Expression
 * */
export const buildWhereClauseExpr = (n1ql: string, clause: LogicalWhereExpr): string => {
  try {
    if (!verifyWhereObjectKey(clause)) {
      return _buildFieldClauseExpr(clause as Record<string, string | number | boolean | ComparisonWhereExpr>);
    }

    return Object.keys(clause)
      .map((key) => {
        if (CollectionSelectOperatorDict[key]) {
          return `${_buildWhereCollectionExpr(key as CollectionSelectOperator, clause[key])}`;
        }
        if (CollectionInWithinOperatorDict[key]) {
          return `${_buildCollectionInWithinOperator(key as CollectionInWithinOperator, clause[key])}`;
        }
        if (Array.isArray(clause[key])) {
          const prefix = key === '$not' ? `${LogicalOperatorDict[key]} ` : '';
          const joinOp = key === '$not' ? ` AND ` : ` ${LogicalOperatorDict[key]} `;
          return `${prefix}(${clause[key]
            .map((value) => buildWhereClauseExpr(n1ql, value as LogicalWhereExpr))
            .join(joinOp)})`;
        } else {
          return `${buildWhereClauseExpr(n1ql, { [key]: clause[key] })}`;
        }
      })
      .join(' AND ');
  } catch (exception) {
    if (exception instanceof WhereClauseException) {
      throw exception;
    }
    throw new WhereClauseException();
  }
};

/**
 * @ignore
 * */
const _buildFieldClauseExpr = (field: Record<string, string | number | boolean | ComparisonWhereExpr>) => {
  try {
    const expr = Object.keys(field).map((value: string) => {
      if (typeof field[value] === 'object' && !Array.isArray(field[value])) {
        return `${_buildComparisionClauseExpr(value, field[value] as ComparisonWhereExpr)}`;
      }
      if (!value.includes('$')) {
        if (typeof field[value] === 'string') {
          return `${escapeReservedWords(value)}=${stringifyValues(field[value])}`;
        }
        if (typeof field[value] === 'number' || typeof field[value] === 'boolean' || Array.isArray(field[value])) {
          return `${escapeReservedWords(value)}=${stringifyValues(field[value])}`;
        }
      }
      throw new QueryOperatorNotFoundException(value);
    });
    return expr.join(' AND ');
  } catch (exception) {
    if (exception instanceof WhereClauseException) {
      throw exception;
    }
    throw new WhereClauseException();
  }
};

/**
 * @ignore
 * */
const _buildComparisionClauseExpr = (fieldName: string, comparison: ComparisonWhereExpr) => {
  try {
    const expr = Object.keys(comparison)
      .map((value: string) => {
        if (!!comparison[value]) {
          if (ComparisonEmptyOperatorDict.hasOwnProperty(value)) {
            return `${escapeReservedWords(fieldName)} ${ComparisonEmptyOperatorDict[value]}`;
          }
          if (ComparisonSingleOperatorDict.hasOwnProperty(value)) {
            return `${escapeReservedWords(fieldName)}${ComparisonSingleOperatorDict[value]}${stringifyValues(
              comparison[value],
            )}`;
          }
          if (ComparisonSingleStringOperatorDict.hasOwnProperty(value)) {
            return `${escapeReservedWords(fieldName)} ${ComparisonSingleStringOperatorDict[value]} ${stringifyValues(
              comparison[value],
            )}`;
          }
          if (ComparisonMultipleOperatorDict.hasOwnProperty(value) && Array.isArray(comparison[value])) {
            return `${escapeReservedWords(fieldName)} ${ComparisonMultipleOperatorDict[value]} ${comparison[value]
              .map((v) => stringifyValues(v))
              .join(' AND ')}`;
          }
        }
        throw new QueryOperatorNotFoundException(value);
      })
      .join(` AND `);
    return Object.keys(comparison).length > 1 ? `(${expr})` : expr;
  } catch (exception) {
    if (exception instanceof WhereClauseException) {
      throw exception;
    }
    throw new WhereClauseException();
  }
};

/**
 * @ignore
 * */
const _buildCollectionInWithinOperator = (
  op: CollectionInWithinOperator,
  expr: CollectionInWithinOperatorValue,
  excludeOperator?: boolean,
): string => {
  if (!op || !expr.target_expr || !expr.search_expr) {
    throw new InWithinOperatorExceptions();
  }
  return `${expr.search_expr}${!excludeOperator && expr.$not ? ' NOT ' : ' '}${CollectionInWithinOperatorDict[op]} ${
    excludeOperator ? expr.target_expr : stringifyValues(expr.target_expr)
  }`;
};

const stringifyValues = (value: unknown) => {
  return JSON.stringify(value).replace(/\\/gi, '');
};

/**
 * @ignore
 * */
const _buildCollectionInWithIn = (collection: CollectionInWithinOperatorType) => {
  const op = collection.$in ? '$in' : collection.$within ? '$within' : undefined;
  if (!op) {
    throw new Error(
      'The Collection Operator needs to have the following clauses declared (IN | WITHIN) and SATISFIES.',
    );
  }
  return `${_buildCollectionInWithinOperator(op, collection[op] as CollectionInWithinOperatorValue, true)}`;
};

/**
 * @ignore
 * */
const _buildWhereCollectionExpr = (op: CollectionSelectOperator, expr: CollectionExpressionType) => {
  return `${CollectionSelectOperatorDict[op]} ${expr.$expr.map((value) => _buildCollectionInWithIn(value)).join(',')} ${
    CollectionSatisfiesOperatorDict['$satisfies']
  } ${buildWhereClauseExpr('', expr.$satisfied)} END`;
};

// end where expression functions

// index expression functions

/**
 * Build a INDEX N1QL query from user-specified parameters.
 * {@link https://docs.couchbase.com/server/6.5/n1ql/n1ql-language-reference/createindex.html}
 * @param collection Collection name
 * @param type INDEX clause types can be 'CREATE' | 'BUILD' | 'DROP' | 'CREATE PRIMARY'
 * @param on ON Clause param
 * @param where WHERE Clause param
 * @param usingGSI use a Global Secondary Index(GSI).
 * @param withExpr WITH Clause param
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
            throw new Error('The WITH clause has an incorrect syntax');
        }
      })
      .join(',');
    return !!resultExpr ? `WITH {${resultExpr}}` : '';
  }
  return '';
};

/**
 * @ignore
 * */
const buildWithNodesExpr = (withNodesExpr?: string[]) => {
  if (withNodesExpr) {
    return `"nodes": ${stringifyValues(withNodesExpr)}`;
  }
};

// end index expression functions
