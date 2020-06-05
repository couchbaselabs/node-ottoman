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
export const selectBuilder = (
  collection: string,
  select: ISelectType[] | string,
  letExpr?: ILetExpr[],
  where?: LogicalWhereExpr,
  orderBy?: Record<string, SortType>,
  limit?: number,
  offset?: number,
  useExpr?: string[],
) => {
  try {
    let expr = '';
    if (typeof select === 'string') {
      expr = select;
    }
    if (Array.isArray(select)) {
      expr = `${select.map((c) => buildSelectExpr('', c)).join(',')}`;
    }

    return `SELECT ${expr} FROM \`${collection}\`${_buildLetExpr(letExpr)}${buildWhereExpr(where)}${_buildOrderByExpr(
      orderBy,
    )}${_buildLimitExpr(limit)}${_buildOffsetExpr(offset)}${_buildUseKeysExpr(useExpr)}`;
  } catch {
    throw new SelectClauseException();
  }
};

const _buildAS = (c: ISelectAggType | IField) => {
  return c.hasOwnProperty('as') ? ` AS ${c['as']}` : '';
};

const _buildField = (clause: IField | string) => {
  if (clause.hasOwnProperty('name')) {
    return `\`${clause['name']}\`${_buildAS(clause as IField)}`;
  }
  return clause;
};

export const buildSelectExpr = (n1ql: string, clause: ISelectType) => {
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

const _buildAggDictExpr = (clause: ISelectAggType, key: string) => {
  if (AggDict.hasOwnProperty(key)) {
    if (clause[key].hasOwnProperty('ro')) {
      return `${ReturnResultDict[clause[key]['ro']]} `;
    }
  }
  return '';
};

const _buildLetExpr = (letExpr: ILetExpr[] | undefined) => {
  return Array.isArray(letExpr)
    ? ` LET ${letExpr.map((value: ILetExpr) => `${value.key} = ${value.value}`).join(',')}`
    : '';
};

const _buildOrderByExpr = (orderExpr: Record<string, SortType> | undefined) => {
  return !!orderExpr
    ? ` ORDER BY ${Object.keys(orderExpr)
        .map((value: string) => `${value} = '${orderExpr[value]}'`)
        .join(',')}`
    : '';
};

const _buildLimitExpr = (limit: number | undefined) => {
  return Number.isInteger(limit) ? ` LIMIT ${limit}` : '';
};

const _buildOffsetExpr = (offset: number | undefined) => {
  return Number.isInteger(offset) ? ` OFFSET ${offset}` : '';
};

const _buildUseKeysExpr = (useKeys: string[] | undefined) => {
  return Array.isArray(useKeys) ? ` USE KEYS [${useKeys.map((value: string) => `'${value}'`).join(',')}]` : '';
};

// end select expressions functions

// where expressions functions

export const buildWhereExpr = (clause: LogicalWhereExpr | undefined) => {
  return clause ? ` WHERE ${buildWhereClauseExpr('', clause)}` : '';
};

export const buildWhereClauseExpr = (n1ql: string, clause: LogicalWhereExpr) => {
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

const _buildFieldClauseExpr = (field: Record<string, string | number | boolean | ComparisonWhereExpr>) => {
  try {
    const expr = Object.keys(field).map((value: string) => {
      if (typeof field[value] === 'object' && !Array.isArray(field[value])) {
        return `${_buildComparisionClauseExpr(value, field[value] as ComparisonWhereExpr)}`;
      }
      if (!value.includes('$')) {
        if (typeof field[value] === 'string') {
          return `${value} = '${field[value]}'`;
        }
        if (typeof field[value] === 'number' || typeof field[value] === 'boolean' || Array.isArray(field[value])) {
          return `${value} = ${JSON.stringify(field[value])}`;
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

const _buildComparisionClauseExpr = (fieldName: string, comparison: ComparisonWhereExpr) => {
  try {
    const expr = Object.keys(comparison)
      .map((value: string) => {
        if (!!comparison[value]) {
          if (ComparisonEmptyOperatorDict.hasOwnProperty(value)) {
            return `${fieldName} ${ComparisonEmptyOperatorDict[value]}`;
          }
          if (ComparisonSingleOperatorDict.hasOwnProperty(value)) {
            return `${fieldName} ${ComparisonSingleOperatorDict[value]} ${comparison[value]}`;
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

// end where expressions functions

// index expressions functions

export const buildIndexExpr = (
  collection: string,
  type: IndexType,
  name: string,
  on?: IIndexOnParams[],
  where?: LogicalWhereExpr,
  usingGSI?: boolean,
  withExpr?: IIndexWithParams,
) => {
  if (['BUILD', 'CREATE', 'CREATE PRIMARY'].includes(type) && on) {
    return `${type} INDEX \`${name}\` ON \`${collection}\`(${buildOnExpr(on)})${buildWhereExpr(where)} ${
      usingGSI ? 'USING GSI' : ''
    } ${buildWithExpr(withExpr)}`;
  } else {
    return `${type} INDEX \`${collection}\`.\`${name}\`${usingGSI ? ' USING GSI' : ''}`;
  }
};

const buildOnExpr = (on: IIndexOnParams[]) => {
  return on
    .map((value: IIndexOnParams) => {
      return `\`${value.name}\`${buildOnSortExpr(value)}`;
    })
    .join(',');
};

const buildOnSortExpr = (onExpr?: IIndexOnParams) => {
  if (onExpr && onExpr.hasOwnProperty('sort')) {
    return `['${onExpr.sort}']`;
  }
  return '';
};

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
            throw new Error('The WITH clause has incorrect syntax');
        }
      })
      .join(',');
    return !!resultExpr ? `WITH {${resultExpr}}` : '';
  }
  return '';
};

const buildWithNodesExpr = (withNodesExpr?: string[]) => {
  if (withNodesExpr) {
    return `'nodes': ${arrayStringToStringSingleQuote(withNodesExpr)}`;
  }
};

const arrayStringToStringSingleQuote = (array: string[]) => {
  return `[${array
    .map((value: string) => {
      return `'${value}'`;
    })
    .join(',')}]`;
};

// end index expressions functions
