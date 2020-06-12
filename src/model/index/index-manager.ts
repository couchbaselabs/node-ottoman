/**
 * Store all indexes
 */
const __indexes: Record<any, { fields: string[]; modelName: string }> = {};

/**
 * Receive an index name and return if it's already registered
 */
export const hasIndex = (indexName: string): boolean => !!__indexes[indexName];

/**
 * Return all indexes
 */
export const getIndexes = () => __indexes;

/**
 * Register a new index
 */
export const registerIndex = (indexName: string, fields, modelName) => {
  __indexes[indexName] = { fields, modelName };
};

/**
 * Remove an existing index
 */
export const removeIndex = (indexName: string) => {
  delete __indexes[indexName];
};
