// to keep compatibility with v1
/**
 * Default value to metadata key, to keep collection tracking
 * eg. This model new Model('User', schema, options), will generate documents -> document._type = 'User'
 */
export const COLLECTION_KEY = '_type';

/**
 * Key to add document metadata identifier
 * This key will store the value of the key,
 * key -> document, document._id === key
 */
export const DEFAULT_ID_KEY = '_id';
