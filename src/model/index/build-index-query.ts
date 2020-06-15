import { FindOptions } from '../../handler/find/find-options';

/**
 * Index function factory
 */
export const buildIndexQuery = (Model, fields, indexFnName, indexOptions = {}) => (...values: any[]) => {
  if (values.length >= fields.length) {
    const filter: any = {};
    let options = indexOptions;
    if (values.length >= fields.length + 1) {
      options = { ...options, ...values[fields.length] };
    }
    for (let i = 0; i < fields.length; i++) {
      const value = values[i];
      if (value instanceof FindOptions) {
        throw new Error(`Function ${indexFnName} received too few arguments`);
      }
      filter[fields[i]] = value;
    }
    return Model.find(filter, options);
  } else {
    throw new Error(`Function ${indexFnName} received too few arguments`);
  }
};
