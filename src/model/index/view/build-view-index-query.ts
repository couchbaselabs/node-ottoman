import { ViewIndexOptions } from './view-index-options';
import { Ottoman } from '../../../ottoman/ottoman';

/**
 * Index function factory
 */
export const buildViewIndexQuery = (ottoman: Ottoman, ddocName, indexName, fields, Model) => async (
  values: any | any[],
  options: ViewIndexOptions = {},
) => {
  const arrayValues = Array.isArray(values) ? values : [values];
  if (values && arrayValues.length === fields.length) {
    options.keys = arrayValues;
    const result = await ottoman.bucket.viewQuery(ddocName, indexName, options);
    const populatedResults: any[] = [];
    for (const row of result.rows) {
      const populatedDocument = await Model.findById(row.id, options);
      populatedResults.push(populatedDocument);
    }
    return { rows: populatedResults, meta: result.meta };
  } else {
    throw new Error(`Function ${indexName} received wrong number of arguments`);
  }
};
