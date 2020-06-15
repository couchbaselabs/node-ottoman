import { ConnectionManager } from '../../connections/connection-manager';
import { getDefaultConnection } from '../../connections/connection-handler';
import { COLLECTION_KEY } from '../../utils/constants';
import { getIndexes } from './index-manager';
import { extractIndexFieldNames } from './extract-index-field-names';

/**
 * Create the register index in the Database Server.
 * in addition one index will be created as primary for the bucketName
 * and one more for every Ottoman model.
 */
export const ensureIndexes = async (connection?: ConnectionManager) => {
  const __indexes = getIndexes();
  const currentConnection = connection || getDefaultConnection();
  const { bucketName, cluster, queryIndexManager } = currentConnection;
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

  // Create secondary indexes declared in the schema
  async function* asyncIndexesQuery() {
    for (const indexName in __indexes) {
      const indexNameSanitized = indexName.replace(/[\\$]/g, '__').replace('[*]', '-ALL').replace(/(::)/g, '-');
      if (!existingIndexesNames.includes(indexNameSanitized)) {
        const index = __indexes[indexName];
        const fieldNames = extractIndexFieldNames(index);
        indexesToBuild.push(indexNameSanitized);
        yield cluster.query(queryBuildIndexDeferred(bucketName, indexNameSanitized, fieldNames, index.modelName));
      }
    }
  }

  for await (const index of asyncIndexesQuery()) {
    if (process.env.DEBUG) {
      console.log(index);
    }
  }

  // All indexes were built deferred, so now kick off the actual build.
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
// concurrency: 1 is important to avoid overwhelming the server.
// Promise.all turns the array into a single promise again.
const queryBuildIndexDeferred = (bucketName, indexName, fields, modelName) =>
  `CREATE INDEX \`${indexName}\` ON \`${bucketName}\`(${fields.join(
    ',',
  )}) WHERE ${COLLECTION_KEY}="${modelName}" USING GSI WITH {"defer_build": true}`;

// All indexes were built deferred, so now kick off the actual build.
const queryBuildIndexes = (bucketName, indexesName: string[]) => {
  return `BUILD INDEX ON \`${bucketName}\`(${indexesName.map((idx) => `\`${idx}\``).join(',')}) USING GSI`;
};
