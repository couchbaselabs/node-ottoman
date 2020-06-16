const replaceList = ['ALL', 'DISTINCT', 'RAW', 'ELEMENT', 'VALUE'];

/**
 * Convert select expression into Array of selection keys
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
