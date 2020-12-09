/**
 * Default value for metadata key, to keep collection tracking
 * eg. This model new Model('User', schema, options), will generate documents -> document._type = 'User'
 */
export const MODEL_KEY = '_type';

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

export const KEY_GENERATOR = ({ metadata, id }) => `${metadata.scopeName}$${metadata.collectionName}::${id}`;

export const DEFAULT_MAX_EXPIRY = '300000';
