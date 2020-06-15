/**
 * Stores all indexes
 */
const __indexes: Record<any, { fields: string[]; modelName: string }> = {};

/**
 * Receives an index name and return if it is already registered
 */
export const hasIndex = (indexName: string): boolean => !!__indexes[indexName];

/**
 * Returns all indexes
 */
export const getIndexes = () => __indexes;

/**
 * Registers a new index
 */
export const registerIndex = (indexName: string, fields, modelName) => {
  __indexes[indexName] = { fields, modelName };
};

/**
 * Removes an existing index
 */
export const removeIndex = (indexName: string) => {
  delete __indexes[indexName];
};
