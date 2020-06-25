import { FindOptions } from '../../../handler';

/**
 * Index function factory
 */
export const buildViewIndexQuery = (connection, ddocName, indexName, fields, Model) => async (...values: any[]) => {
  if (values.length >= fields.length) {
    let options: any = {};
    if (values.length >= fields.length + 1) {
      options = { ...options, ...values[fields.length] };
      if (options.key && options.range) {
        throw new Error('Cannot query by name and range at the same time!');
      }
    }
    const key: any[] = [];
    for (let i = 0; i < fields.length; i++) {
      const value = values[i];
      if (value instanceof FindOptions) {
        throw new Error(`Function ${name} receive to few arguments`);
      }
      key.push(value);
    }

    options.key = key;
    const result = await connection.bucket.viewQuery(ddocName, indexName, options);
    const populatedResults: any[] = [];
    for (const row of result.rows) {
      const populatedDocument = await Model.findById(row.id, options);
      populatedResults.push(populatedDocument);
    }
    return { rows: populatedResults, meta: result.meta };
  } else {
    throw new Error(`Function ${indexName} receive to few arguments`);
  }
};
