import jsonpath from 'jsonpath';

export const jpParse = (pathStr: string) => {
  // Temporary fix until we have our own parser.
  const dollarKey = 'SUPERWACKYDOLLARKEY';

  const path = jsonpath.parse(pathStr.replace('$', dollarKey));
  for (let i = 0; i < path.length; ++i) {
    const pathPart = path[i];

    if (pathPart.scope !== 'child') {
      throw new Error('Expected child selectors only.');
    }
    if (pathPart.operation !== 'member' && pathPart.operation !== 'subscript') {
      throw new Error('Expected member and subscript selectors only.');
    }
    if (pathPart.expression.type === 'wildcard') {
      delete pathPart.expression.value;
    }

    if (pathPart.expression.value) {
      pathPart.expression.value = pathPart.expression.value.replace(dollarKey, '$');
    }

    delete pathPart.scope;
  }
  return path;
};
