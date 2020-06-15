import { COLLECTION_KEY } from '../../utils/constants';
import { Query } from '../../query';
import { FindOptions } from './find-options';
import { execPopulation } from '../../utils/populate/exec-populate';
import { extractSelect } from '../../utils/query/extract-select';
import { canBePopulated } from '../../utils/populate/can-be-populated';
import { extractPopulate } from '../../utils/query/extract-populate';
import { ModelMetadata } from '../../model/interfaces/model-metadata';

/**
 * Find documents
 * Allow to use some filters and other useful options
 * @ignore
 */
export const find = (metadata: ModelMetadata) => async (filter: any = {}, options: FindOptions = {}) => {
  const { skip, limit, select, populate } = options;
  const { connection, collectionName, schema, collection } = metadata;
  const { bucketName, cluster } = connection;
  const schemaFields = Object.keys(schema.fields);
  // Handling select
  const selectFields = extractSelect(select || schemaFields);

  // Handling conditions
  const expr_where = {
    ...filter,
    [COLLECTION_KEY as string]: collectionName,
  };

  // Building the query
  let query = new Query({}, bucketName).select(selectFields.join(', ')).where(expr_where);
  query = query.limit(limit || 50);
  if (skip) {
    query = query.offset(skip);
  }
  const result = cluster.query(query.build());
  return result.then(async (r) => {
    if (populate) {
      const populateFields = extractPopulate(populate);
      for (const toPopulate of populateFields) {
        if (canBePopulated(toPopulate, selectFields)) {
          await execPopulation(r.rows, toPopulate, collection);
        }
      }
      return r;
    }
    return r;
  });
};
