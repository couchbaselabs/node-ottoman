export const indexFieldsName = (fields: string[]) => {
  const fieldKeys: string[] = [];
  for (let i = 0; i < fields.length; ++i) {
    fieldKeys.push(fields[i].replace(/\./g, '::'));
  }
  return `$${fieldKeys.join('$')}`;
};
