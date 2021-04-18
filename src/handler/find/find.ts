import { QueryScanConsistency } from 'couchbase';
import { getModelMetadata, SearchConsistency } from '../..';
import { ModelMetadata } from '../../model/interfaces/model-metadata.interface';
import { ModelTypes } from '../../model/model.types';
import { LogicalWhereExpr, Query } from '../../query';
import { CAST_STRATEGY } from '../../utils/cast-strategy';
import { canBePopulated } from '../../utils/populate/can-be-populated';
import { execPopulation } from '../../utils/populate/exec-populate';
import { extractPopulate } from '../../utils/query/extract-populate';
import { getProjectionFields } from '../../utils/query/extract-select';
import { FindOptions } from './find-options';

/**
 * Find documents
 * Allows to use some filters and other useful options
 * @ignore
 */
export const find = (metadata: ModelMetadata) => async (
  filter: LogicalWhereExpr = {},
  options: FindOptions = {},
): Promise<{ rows: ModelTypes[] }> => {
  const { skip, limit, sort, populate, select, noCollection, populateMaxDeep, consistency, lean, ignoreCase } = options;
  const { ottoman, collectionName, modelKey, scopeName, modelName, ID_KEY, schema } = metadata;
  const { bucketName, cluster } = ottoman;
  let fromClause = bucketName;
  let selectDot = bucketName;
  if (collectionName !== '_default') {
    fromClause = `\`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\``;
    selectDot = collectionName;
  }
  // Handling select
  const Model = ottoman.getModel(modelName);
  let fields: any = Object.keys(getModelMetadata(Model).schema.fields);

  if (!fields.includes(ID_KEY)) {
    fields.push(ID_KEY);
  }
  fields = fields.map((field) => `\`${field}\``);
  if (select || !schema.options.strict) {
    fields = select;
  }
  const projectionFields = getProjectionFields(
    selectDot,
    fields,
    {
      noCollection: !schema.options.strict ? noCollection : true,
    },
    modelKey,
  );

  // Handling conditions
  const expr_where = {
    ...filter,
    [modelKey as string]: modelName,
  };

  // Building the query
  let query = new Query({}, fromClause).select(projectionFields.projection).where(expr_where);
  if (limit) {
    query = query.limit(limit);
  }
  if (skip) {
    query = query.offset(skip);
  }
  if (sort) {
    query = query.orderBy(sort);
  }
  const queryOptions: Record<string, unknown> = {};
  const _consistency = consistency || ottoman.config.searchConsistency || SearchConsistency.NONE;
  switch (_consistency) {
    case SearchConsistency.GLOBAL:
    case SearchConsistency.LOCAL:
      queryOptions.scanConsistency = QueryScanConsistency.RequestPlus;
      break;
    case SearchConsistency.NONE:
      queryOptions.scanConsistency = QueryScanConsistency.NotBounded;
      break;
  }
  const result = cluster.query(query.build({ ignoreCase }), queryOptions);

  return result.then(async (r: { rows: any[] }) => {
    if (select !== 'RAW COUNT(*) as count') {
      r.rows = r.rows.map((row) => new Model(row, { strict: false, strategy: CAST_STRATEGY.KEEP }));
      if (populate) {
        const populateFields = extractPopulate(populate);
        for (const toPopulate of populateFields) {
          if (canBePopulated(toPopulate, projectionFields.fields)) {
            await execPopulation(r.rows, toPopulate, ottoman, modelName, populateMaxDeep);
          }
        }
      }
    }
    if (lean) {
      r.rows = r.rows.map((value: any) => value.toObject());
    }
    return r;
  });
};
