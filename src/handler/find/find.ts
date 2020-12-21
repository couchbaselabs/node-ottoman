import { LogicalWhereExpr, Query } from '../../query';
import { FindOptions } from './find-options';
import { execPopulation } from '../../utils/populate/exec-populate';
import { getProjectionFields } from '../../utils/query/extract-select';
import { canBePopulated } from '../../utils/populate/can-be-populated';
import { extractPopulate } from '../../utils/query/extract-populate';
import { ModelMetadata } from '../../model/interfaces/model-metadata.interface';
import { SearchConsistency } from '../..';
import { CAST_STRATEGY } from '../../utils/cast-strategy';

/**
 * Find documents
 * Allows to use some filters and other useful options
 * @ignore
 */
export const find = (metadata: ModelMetadata) => async (filter: LogicalWhereExpr = {}, options: FindOptions = {}) => {
  const { skip, limit, sort, populate, select, noCollection, populateMaxDeep, consistency } = options;
  const { ottoman, collectionName, modelKey, scopeName, modelName } = metadata;
  const { bucketName, cluster, couchbase } = ottoman;
  let fromClause = bucketName;
  let selectDot = bucketName;
  if (collectionName !== '_default') {
    fromClause = `\`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\``;
    selectDot = collectionName;
  }
  // Handling select
  const projectionFields = getProjectionFields(
    selectDot,
    select,
    {
      noCollection,
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
  switch (consistency) {
    case SearchConsistency.GLOBAL:
    case SearchConsistency.LOCAL:
      queryOptions.scanConsistency = couchbase.QueryScanConsistency.RequestPlus;
      break;
    case SearchConsistency.NONE:
      queryOptions.scanConsistency = couchbase.QueryScanConsistency.NotBounded;
      break;
  }
  const result = cluster.query(query.build(), queryOptions);

  return result.then(async (r: { rows: unknown[] }) => {
    if (select !== 'RAW COUNT(*) as count') {
      const Model = ottoman.getModel(modelName);
      r.rows = r.rows.map((row) => new Model(row, { strict: false, strategy: CAST_STRATEGY.KEEP }));
      if (populate) {
        const populateFields = extractPopulate(populate);
        for (const toPopulate of populateFields) {
          if (canBePopulated(toPopulate, projectionFields.fields)) {
            await execPopulation(r.rows, toPopulate, ottoman, modelName, populateMaxDeep);
          }
        }
        return r;
      }
    }
    return r;
  });
};
