import { LogicalWhereExpr, Query } from '../../query';
import { FindOptions } from './find-options';
import { execPopulation } from '../../utils/populate/exec-populate';
import { getProjectionFields } from '../../utils/query/extract-select';
import { canBePopulated } from '../../utils/populate/can-be-populated';
import { extractPopulate } from '../../utils/query/extract-populate';
import { ModelMetadata } from '../../model/interfaces/model-metadata.interface';
import { SearchConsistency } from '../..';

/**
 * Find documents
 * Allows to use some filters and other useful options
 * @ignore
 */
export const find = (metadata: ModelMetadata) => async (filter: LogicalWhereExpr = {}, options: FindOptions = {}) => {
  const { skip, limit, sort, populate, select, noCollection, noId, populateMaxDeep, consistency } = options;
  const { connection, collectionName, collectionKey, scopeKey, scopeName, modelName } = metadata;
  const { bucketName, cluster } = connection;
  // Handling select
  const projectionFields = getProjectionFields(bucketName, select, { noId: noId, noCollection: noCollection });

  // Handling conditions
  const expr_where = {
    ...filter,
    [scopeKey as string]: scopeName,
    [collectionKey as string]: collectionName,
  };

  // Building the query
  let query = new Query({}, bucketName).select(projectionFields.projection).where(expr_where);
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
      queryOptions.scanConsistency = connection.couchbase.QueryScanConsistency.RequestPlus;
      break;
    case SearchConsistency.NONE:
      queryOptions.scanConsistency = connection.couchbase.QueryScanConsistency.NotBounded;
      break;
  }
  const result = cluster.query(query.build(), queryOptions);
  return result.then(async (r: { rows: unknown[] }) => {
    if (populate) {
      const populateFields = extractPopulate(populate);
      for (const toPopulate of populateFields) {
        if (canBePopulated(toPopulate, projectionFields.fields)) {
          await execPopulation(r.rows, toPopulate, connection, modelName, populateMaxDeep);
        }
      }
      return r;
    }
    return r;
  });
};
