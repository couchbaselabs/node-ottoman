interface configOptions {
  collectionKey?: string;
  scopeKey?: string;
  populateMaxDeep?: number;
}
export const globalConfig = ({ collectionKey, scopeKey, populateMaxDeep }: configOptions = {}) => {
  collectionKey && (COLLECTION_KEY = collectionKey);
  scopeKey && (SCOPE_KEY = scopeKey);
  populateMaxDeep && (DEFAULT_POPULATE_MAX_DEEP = populateMaxDeep);
};

export const getCollectionKey = (): string => COLLECTION_KEY;
export const getScopeKey = (): string => SCOPE_KEY;

/**
 * Default value for metadata key, to keep collection tracking
 * eg. This model new Model('User', schema, options), will generate documents -> document._type = 'User'
 */
export let COLLECTION_KEY = 'type';

/**
 * Default value to metadata key, to keep scope tracking
 * eg. This model new Model('User', schema, {scope: 'app'}), will generate documents -> document._scope = 'app'
 */
export let SCOPE_KEY = '_scope';

/**
 * Key to add document metadata identifier
 * This key will store the value of the key,
 * key -> document, document.id === key
 */
export const DEFAULT_ID_KEY = 'id';

/**
 * Default scope name
 */
export const DEFAULT_SCOPE = '_default';

/**
 * Default collection name
 */
export const DEFAULT_COLLECTION = '_default';

export let DEFAULT_POPULATE_MAX_DEEP = 1;
