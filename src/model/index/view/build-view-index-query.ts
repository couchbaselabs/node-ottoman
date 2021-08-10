import { ViewIndexOptions } from './view-index-options';
import { Ottoman } from '../../../ottoman/ottoman';
import { BuildIndexQueryError } from '../../../exceptions/ottoman-errors';

/**
 * Index function factory.
 */
export const buildViewIndexQuery = (ottoman: Ottoman, designDocName, indexName, fields, Model) => async (
  values: any | any[],
  options: ViewIndexOptions = {},
) => {
  if (!values) {
    throw new BuildIndexQueryError(
      `Function '${indexName}' received wrong argument value, '${values}' wasn't expected`,
    );
  }
  const arrayValues = Array.isArray(values) ? values : [values];
  const fieldsLength = fields.length;
  const valuesLength = arrayValues.length;

  if (valuesLength !== fieldsLength) {
    throw new BuildIndexQueryError(
      `Function '${indexName}' received wrong number of arguments, '${fieldsLength}:[${fields}]' argument(s) was expected and '${valuesLength}:[${arrayValues}]' were received`,
    );
  }
  options.keys = arrayValues;
  const result = await ottoman.bucket.viewQuery(designDocName, indexName, options);
  const populatedResults: any[] = [];
  for (const row of result.rows) {
    const populatedDocument = await Model.findById(row.id, options);
    populatedResults.push(populatedDocument);
  }
  return { rows: populatedResults, meta: result.meta };
};
