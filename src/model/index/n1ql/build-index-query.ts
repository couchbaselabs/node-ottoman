import { FindOptions } from '../../../handler';

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
    if (values.length === fields.length) {
      filter = {};
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        filter[field] = values[i];
      }
    } else {
      throw new Error(`Function ${indexFnName} received wrong number of arguments`);
    }
  }
  return Model.find(filter, n1qlOptions);
};
