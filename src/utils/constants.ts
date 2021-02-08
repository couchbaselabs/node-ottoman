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

/**
 * Default KeyGenerator function
 */
export const KEY_GENERATOR = ({ metadata }) => `${metadata.modelName}`;

/**
 * Internal KeyGenerator function
 * @param keyGen
 * @param metadata
 * @param id
 */
export const _keyGenerator = (keyGen, { metadata, id }) => {
  const prefix = keyGen({ metadata });
  const key = prefix ? `::${id}` : id;
  return `${prefix}${key}`;
};

export const DEFAULT_MAX_EXPIRY = 300000;
