export const pathToN1QL = (path) => {
  const fields: string[] = [];
  for (let k = 0; k < path.length; ++k) {
    if (path[k].operation === 'member') {
      if (path[k].expression.type !== 'identifier') {
        throw new Error('Unexpected member expression type.');
      }
      fields.push(`\`${path[k].expression.value}\``);
    } else if (path[k].operation === 'subscript') {
      if (path[k].expression.type !== 'string_literal') {
        throw new Error('Unexpected subscript expression type.');
      }
      fields.push(`\`${path[k].expression.value}\``);
    } else {
      throw new Error('Unexpected path operation type.');
    }
  }
  return fields.join('.');
};
