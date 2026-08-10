import { n1qlReservedWords } from './helpers';

const replaceList = ['ALL', 'DISTINCT', 'RAW', 'ELEMENT', 'VALUE'];

/**
 * Matches the result-modifier keywords as whole words, so a field whose name merely
 * contains one of them (`allowed`, `values`) is left alone.
 * @ignore
 * */
const replaceListExpr = new RegExp(`\\b(${replaceList.join('|')})\\b`, 'g');

export const escapeFromClause = (str: string) => {
  const trimStr = str.trim();
  const [collection, ...rest] = trimStr.split(' ');
  const parts = collection.split('.');
  const result: string[] = [];
  for (const part of parts) {
    const cleanBacksticks = part.replace(/`/g, '');
    result.push(`\`${cleanBacksticks}\``);
  }
  return `${result.join('.')}${rest.length > 0 ? ` ${rest.map((item) => item.replace(/`/g, '')).join(' ')}` : ''}`;
};

/**
 * Wrap a single identifier in backticks.
 *
 * N1QL escapes a backtick inside a quoted identifier by doubling it, so doubling
 * here keeps the identifier intact while making it impossible for the value to
 * close the quoting and continue the statement.
 * */
export const escapeIdentifier = (identifier: string) => {
  return `\`${String(identifier).replace(/`/g, '``')}\``;
};

/**
 * Quote every segment of a dotted field path.
 *
 * Each segment is escaped on its own so that `metadata.doc_type` stays a path to a
 * nested field rather than collapsing into a single identifier containing a dot.
 * */
export const escapeFieldPath = (path: string) => {
  return String(path).split('.').map(escapeIdentifier).join('.');
};

/**
 * Convert select expression into an Array of selection keys
 * */
export const parseStringSelectExpr = (expr: string): string[] => {
  if (expr.indexOf(',') === -1 && expr.indexOf(' as ') === -1) {
    return [expr];
  }
  const resultExpr = expr.replace(/[()]/g, '').replace(replaceListExpr, '');
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
