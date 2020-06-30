import { n1qlReservedWords } from './helpers';

const replaceList = ['ALL', 'DISTINCT', 'RAW', 'ELEMENT', 'VALUE'];

/**
 * Convert select expression into an Array of selection keys
 * */
export const parseStringSelectExpr = (expr: string): string[] => {
  if (expr.indexOf(',') === -1 && expr.indexOf(' as ') === -1) {
    return [expr];
  }
  let resultExpr = expr.replace(/[()]/g, '');
  replaceList.forEach((value: string) => {
    resultExpr = resultExpr.replace(new RegExp(`/[${value}]/`, 'g'), '');
  });
  return resultExpr.split(',').map((v: string) => {
    return extractAsValue(v);
  });
};

/**
 * @ignore
 * */
const extractAsValue = (expr: string): string => {
  const result = expr.toLowerCase().split(' as ');
  if (result.length === 2) {
    return result[1].trim();
  }
  return expr.trim();
};

/**
 * @ignore
 */
export const escapeReservedWords = (field: string) => {
  if (n1qlReservedWords.includes(field.toUpperCase())) {
    return `\`${field}\``;
  }
  if (field.match(/(\-)|(\.)|(\[\d+\])/g)) {
    let expr = field;
    expr = expr
      .split('.')
      .map((value) => {
        if (n1qlReservedWords.includes(value.toUpperCase())) {
          return `\`${value}\``;
        }
        return value;
      })
      .join('.');
    expr = expr.replace(/([a-z0-9]*\-[a-z0-9]*)/g, '`$&`');
    return expr;
  }
  return field;
};
