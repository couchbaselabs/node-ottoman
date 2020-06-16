import {
  ComparisonWhereExpr,
  IField,
  IIndexOnParams,
  IIndexWithParams,
  ILetExpr,
  IndexType,
  ISelectAggType,
  ISelectType,
  LogicalWhereExpr,
  SortType,
} from '../interface';
import {
  AggDict,
  ComparisonEmptyOperatorDict,
  ComparisonMultipleOperatorDict,
  ComparisonSingleOperatorDict,
  ComparisonSingleStringOperatorDict,
  LogicalOperatorDict,
  ResultExprDict,
  ReturnResultDict,
} from './dictionary';
import { QueryOperatorNotFoundException, SelectClauseException, WhereClauseException } from '../exceptions';

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
): string => {
  try {
    let expr = '';
    if (typeof select === 'string') {
      expr = select;
    }
    if (Array.isArray(select)) {
      expr = buildSelectArrayExpr(select);
    }

    return `SELECT ${expr} FROM \`${collection}\`${_buildUseKeysExpr(useExpr)}${_buildLetExpr(letExpr)}${buildWhereExpr(
      where,
    )}${_buildOrderByExpr(orderBy)}${_buildLimitExpr(limit)}${_buildOffsetExpr(offset)}`;
  } catch {
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
    return `\`${clause['name']}\`${_buildAS(clause as IField)}`;
  }
  return `\`${clause}\``;
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
const _buildLetExpr = (letExpr: ILetExpr[] | undefined) => {
  return Array.isArray(letExpr)
    ? ` LET ${letExpr.map((value: ILetExpr) => `${value.key}=${value.value}`).join(',')}`
    : '';
};

/**
 * @ignore
 * */
const _buildOrderByExpr = (orderExpr: Record<string, SortType> | undefined) => {
  return !!orderExpr
    ? ` ORDER BY ${Object.keys(orderExpr)
        .map((value: string) => `${value} ${orderExpr[value]}`)
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
  return Array.isArray(useKeys) ? ` USE KEYS [${useKeys.map((value: string) => `'${value}'`).join(',')}]` : '';
};

// end select expression functions

// where expression functions

/**
 * Create WHERE N1QL Expressions.
 * {@link https://docs.couchbase.com/server/6.5/n1ql/n1ql-language-reference/where.html}
 * @param clause WHERE Clause param
 * @return N1QL WHERE Expression
 * */
export const buildWhereExpr = (clause: LogicalWhereExpr | undefined): string => {
  return clause ? ` WHERE ${buildWhereClauseExpr('', clause)}` : '';
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
    if (!clause.hasOwnProperty('$and') && !clause.hasOwnProperty('$or') && !clause.hasOwnProperty('$not')) {
      return _buildFieldClauseExpr(clause as Record<string, string | number | boolean | ComparisonWhereExpr>);
    }

    return Object.keys(clause)
      .map((key) => {
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
    if (exception instanceof QueryOperatorNotFoundException) {
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
          return `${value}='${field[value]}'`;
        }
        if (typeof field[value] === 'number' || typeof field[value] === 'boolean' || Array.isArray(field[value])) {
          return `${value}=${JSON.stringify(field[value])}`;
        }
      }
      throw new QueryOperatorNotFoundException(value);
    });
    return expr.join(' AND ');
  } catch (exception) {
    if (exception instanceof QueryOperatorNotFoundException) {
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
            return `${fieldName} ${ComparisonEmptyOperatorDict[value]}`;
          }
          if (ComparisonSingleOperatorDict.hasOwnProperty(value)) {
            return `${fieldName}${ComparisonSingleOperatorDict[value]}${comparison[value]}`;
          }
          if (ComparisonSingleStringOperatorDict.hasOwnProperty(value)) {
            return `${fieldName} ${ComparisonSingleStringOperatorDict[value]} '${comparison[value]}'`;
          }
          if (ComparisonMultipleOperatorDict.hasOwnProperty(value) && Array.isArray(comparison[value])) {
            return `${fieldName} ${ComparisonMultipleOperatorDict[value]} ${comparison[value].join(' AND ')}`;
          }
        }
        throw new QueryOperatorNotFoundException(value);
      })
      .join(` AND `);
    return Object.keys(comparison).length > 1 ? `(${expr})` : expr;
  } catch (exception) {
    if (exception instanceof QueryOperatorNotFoundException) {
      throw exception;
    }
    throw new WhereClauseException();
  }
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
      return `\`${value.name}\`${buildOnSortExpr(value)}`;
    })
    .join(',');
};

/**
 * @ignore
 * */
const buildOnSortExpr = (onExpr?: IIndexOnParams) => {
  if (onExpr && onExpr.hasOwnProperty('sort')) {
    return `['${onExpr.sort}']`;
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
            return `'${value}': ${withExpr[value]}`;
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
    return `'nodes': ${arrayStringToStringSingleQuote(withNodesExpr)}`;
  }
};

/**
 * @ignore
 * */
const arrayStringToStringSingleQuote = (array: string[]) => {
  return `[${array
    .map((value: string) => {
      return `'${value}'`;
    })
    .join(',')}]`;
};

// end index expression functions
