import { FindOptions } from '../../../handler';
import { BuildIndexQueryError } from '../../../exceptions/ottoman-errors';

/**
 * View index function factory
 */
export const buildIndexQuery = (Model, fields, indexFnName, indexOptions = {}) => (
  values: any | any[],
  options: FindOptions = {},
) => {
  values = Array.isArray(values) ? values : typeof values === 'string' ? [values] : values;
  let filter = values;
  const n1qlOptions = { ...indexOptions, ...options };
  if (Array.isArray(values)) {
    if (values.length !== fields.length) {
      throw new BuildIndexQueryError(
        `Function '${indexFnName}' received wrong number of arguments, '${fields.length}:[${fields}]' argument(s) was expected and '${values.length}:[${values}]' were received`,
      );
    }
    filter = {};
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (field.includes('[*]')) {
        const [target, targetField] = field.split('[*].');
        filter['$any'] = {
          $expr: [{ $in: { search_expr: 'x', target_expr: target } }],
          $satisfies: { [`x.${targetField}`]: values[i] },
        };
      } else {
        filter[field] = values[i];
      }
    }
  }
  return Model.find(filter, n1qlOptions);
};
