import { WhereClauseException } from './exceptions';
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
 * A single path segment: an optionally backtick-quoted name, followed by any number of
 * array subscripts (`[0]`, `[-1]`, `[*]`).
 * @ignore
 * */
const FIELD_SEGMENT = '`?[A-Za-z_$][A-Za-z0-9_$-]*`?(?:\\[(?:\\*|-?\\d+)\\])*';

/**
 * A field path is one or more of those segments joined by dots.
 * @ignore
 * */
const FIELD_PATH_EXPR = new RegExp(`^${FIELD_SEGMENT}(?:\\.${FIELD_SEGMENT})*$`);

/**
 * Escape a name used as a document field in a WHERE clause.
 *
 * `escapeReservedWords` only adds backticks for reserved words and for names holding a
 * dash or subscript; every other name is emitted verbatim. That is fine for the clauses
 * whose operands are deliberately N1QL expressions (GROUP BY, `$field`), but a WHERE key
 * is a document field, and these keys routinely come from request data. A key such as
 * `'a) OR 1=1 --'` would otherwise be interpolated as syntax, so a name that is not a
 * field path is rejected instead of escaped.
 * */
export const escapeFieldName = (field: string) => {
  if (!FIELD_PATH_EXPR.test(field)) {
    throw new WhereClauseException(
      `The field name '${field}' is not a valid field path. Expected a document field, optionally dotted and subscripted, e.g. 'address.city' or 'numbers[-1]'.`,
    );
  }
  return escapeReservedWords(field);
};

/**
 * Escape the left-hand side of a collection `IN`/`WITHIN` operator.
 *
 * Unlike an ordinary comparison, this side may be a literal being searched for rather
 * than a field — `"CORSAIR" WITHIN t` is valid. A quoted literal is re-escaped so that a
 * quote inside it cannot terminate it; anything else has to be a field path.
 * */
export const escapeSearchExpr = (expr: string) => {
  const literal = /^"([\s\S]*)"$/.exec(expr);
  return literal ? JSON.stringify(literal[1]) : escapeFieldName(expr);
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
    // Quote names containing a dash.
    //
    // The run is matched with a single character class so the match cannot backtrack.
    // Requiring a dash *after* an alphanumeric run — `[a-zA-Z0-9]+-` — reads more directly
    // but is quadratic: for every start position in a long dash-free name the engine
    // matches to the end and then backtracks the whole way looking for the dash.
    //
    // Whether the run is a dashed name is then decided with plain string checks. A run
    // starting with the dash is a negative array subscript, where the preceding character
    // is `[` rather than part of a name, and must not be quoted into `numbers[`-1`]`.
    expr = expr.replace(/[a-zA-Z0-9-]+/g, (run) => (run.includes('-') && !run.startsWith('-') ? `\`${run}\`` : run));
    return expr;
  }
  return field;
};
