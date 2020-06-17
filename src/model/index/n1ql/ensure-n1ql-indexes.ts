import { extractIndexFieldNames } from './extract-index-field-names';
import { getIndexes } from '../index-manager';
import { COLLECTION_KEY } from '../../../utils/constants';
import { ConnectionManager } from '../../../connections/connection-manager';

/**
 * Create the register index in the Database Server.
 * in Adition 1 index will be create as primary for the bucketName
 * and others more by every Ottoman model.
 */
export const ensureN1qlIndexes = async (connection: ConnectionManager) => {
  const __indexes = getIndexes();
  const { bucketName, cluster, queryIndexManager } = connection;
  const indexes = await queryIndexManager.getAllIndexes(bucketName);
  const indexesToBuild: string[] = [];
  const existingIndexesNames: string[] = indexes.map((index) => index.name);

  // Create primary index; without this, nothing works.
  if (!existingIndexesNames.includes('#primary')) {
    await cluster.query(queryForPrimaryIndex(bucketName));
  }

  // Create ottoman type index, needed to make model lookups fast.
  const ottomanType = `Ottoman${COLLECTION_KEY}`;
  if (!existingIndexesNames.includes(ottomanType)) {
    await cluster.query(queryForIndexOttomanType(bucketName));
    indexesToBuild.push(ottomanType);
  }

  // Create secondary indexes declare in the schema
  async function* asyncIndexesQuery() {
    for (const indexName in __indexes) {
      const indexNameSanitized = indexName.replace(/[\\$]/g, '__').replace('[*]', '-ALL').replace(/(::)/g, '-');
      if (!existingIndexesNames.includes(indexNameSanitized)) {
        const index = __indexes[indexName];
        const fieldNames = extractIndexFieldNames(index);
        indexesToBuild.push(indexNameSanitized);
        yield cluster.query(queryBuildIndexDefered(bucketName, indexNameSanitized, fieldNames, index.modelName));
      }
    }
  }

  for await (const index of asyncIndexesQuery()) {
    if (process.env.DEBUG) {
      console.log(index);
    }
  }

  // All indexes were built deferred, so now kick off actual build.
  if (indexesToBuild.length > 0) {
    return await cluster.query(queryBuildIndexes(bucketName, indexesToBuild));
  }
  return Promise.resolve(true);
};

// Create primary index; without this, nothing works.
const queryForPrimaryIndex = (bucketName): string => `CREATE PRIMARY INDEX ON \`${bucketName}\` USING GSI`;

// Create ottoman type index, needed to make model lookups fast.
const queryForIndexOttomanType = (bucketName): string =>
  `CREATE INDEX \`Ottoman${COLLECTION_KEY}\` ON \`${bucketName}\`(\`${COLLECTION_KEY}\`) USING GSI WITH {"defer_build": true}`;

// Map createIndex across all individual n1ql model indexes.
// concurrency: 1 is important to avoid overwhelming server.
// Promise.all turns the array into a single promise again.
const queryBuildIndexDefered = (bucketName, indexName, fields, modelName) =>
  `CREATE INDEX \`${indexName}\` ON \`${bucketName}\`(${fields.join(
    ',',
  )}) WHERE ${COLLECTION_KEY}="${modelName}" USING GSI WITH {"defer_build": true}`;

// All indexes were built deferred, so now kick off actual build.
const queryBuildIndexes = (bucketName, indexesName: string[]) => {
  return `BUILD INDEX ON \`${bucketName}\`(${indexesName.map((idx) => `\`${idx}\``).join(',')}) USING GSI`;
};
