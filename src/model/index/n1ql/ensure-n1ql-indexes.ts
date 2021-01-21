import { extractIndexFieldNames } from './extract-index-field-names';
import { getModelMetadata } from '../../utils/model.utils';
import { ModelMetadata } from '../../interfaces/model-metadata.interface';
import { isDebugMode } from '../../../utils/is-debug-mode';
import { Ottoman } from '../../../ottoman/ottoman';
import { DEFAULT_COLLECTION } from '../../../utils/constants';

/**
 * Creates the register index in the Database Server.
 * In addition, creates one index as primary for the bucketName
 * and one for every Ottoman model.
 */
export const ensureN1qlIndexes = async (ottoman: Ottoman, n1qlIndexes) => {
  const __indexes = n1qlIndexes;
  const { bucketName, cluster, queryIndexManager } = ottoman;
  const indexes = await queryIndexManager.getAllIndexes(bucketName);
  const indexesToBuild: Record<string, string[]> = {};
  const existingIndexesNames: string[] = indexes.map((index) => index.name);

  // Create the ottoman type index, needed to make model lookups fast.
  const keys = Object.keys(ottoman.models);
  for (const key of keys) {
    const Model = ottoman.getModel(key);
    const metadata = getModelMetadata(Model);
    const { modelName, modelKey, scopeName, collectionName } = metadata;
    const name =
      collectionName !== DEFAULT_COLLECTION ? `Ottoman${scopeName}${modelName}` : `Ottoman${scopeName}${modelKey}`;
    if (!existingIndexesNames.includes(name)) {
      const on =
        collectionName !== DEFAULT_COLLECTION
          ? `\`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\``
          : `\`${bucketName}\``;
      try {
        if (!indexesToBuild[on]) {
          indexesToBuild[on] = [];
        }
        indexesToBuild[on].push(name);
        await cluster.query(queryForIndexOttomanType(name, on, modelKey));
      } catch (e) {
        if (e.context.first_error_message !== `The index ${name} already exists.`) {
          console.error(`Failed creating N1QL index ${name}`);
          throw e;
        }
      }
    }
  }

  // Create secondary indexes declared in the schema
  async function* asyncIndexesQuery() {
    for (const indexName in __indexes) {
      const indexNameSanitized = indexName.replace(/[\\$]/g, '__').replace('[*]', '-ALL').replace(/(::)/g, '-');
      if (!existingIndexesNames.includes(indexNameSanitized)) {
        const index = __indexes[indexName];

        const fieldNames = extractIndexFieldNames(index);

        const Model = ottoman.getModel(index.modelName);
        const metadata = getModelMetadata(Model);
        const { scopeName, collectionName } = metadata;
        const on =
          collectionName !== DEFAULT_COLLECTION
            ? `\`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\``
            : `\`${bucketName}\``;
        yield cluster
          .query(queryBuildIndexDefered(indexNameSanitized, fieldNames, metadata, on))
          .then(() => {
            if (!indexesToBuild[on]) {
              indexesToBuild[on] = [];
            }
            indexesToBuild[on].push(indexNameSanitized);
          })
          .catch((e) => {
            if (e.context.first_error_message !== `The index ${indexNameSanitized} already exists.`) {
              console.error(`Failed creating Secondary N1QL index ${indexNameSanitized}`);
              throw e;
            }
          });
      }
    }
  }

  for await (const index of asyncIndexesQuery()) {
    if (isDebugMode()) {
      console.log(index);
    }
  }

  // All indexes were built deferred, so now kick off the actual build.
  for (const key in indexesToBuild) {
    const buildIndexes = indexesToBuild[key];
    if (buildIndexes && buildIndexes.length > 0) {
      const buildIndexesQuery = queryBuildIndexes(key, [...new Set(buildIndexes)]);
      try {
        await cluster.query(buildIndexesQuery);
      } catch (e) {
        console.log(e);
      }
    }
  }

  return Promise.resolve(true);
};

// Create the ottoman type index, needed to make model lookups fast.
const queryForIndexOttomanType = (ottomanType: string, on: string, collectionKey: string): string => {
  return `CREATE INDEX \`${ottomanType}\` ON ${on}(\`${collectionKey}\`) USING GSI WITH {"defer_build": true}`;
};

// Map createIndex across all individual n1ql model indexes.
// concurrency: 1 is important to avoid overwhelming the server.
const queryBuildIndexDefered = (indexName, fields, metadata: ModelMetadata, on: string) => {
  const { modelKey, modelName } = metadata;
  return `CREATE INDEX \`${indexName}\` ON ${on}(${fields.join(
    ',',
  )}) WHERE ${modelKey}="${modelName}"  USING GSI WITH {"defer_build": true}`;
};

// All indexes were built deferred, so now kick off actual build.
const queryBuildIndexes = (on, indexesName: string[]) => {
  return `BUILD INDEX ON ${on}(${indexesName.map((idx) => `\`${idx}\``).join(',')}) USING GSI`;
};
