import { BadKeyGeneratorDelimiterError } from '../exceptions/ottoman-errors';

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
 * Default KeyGeneratorDelimiter value
 */
export const KEY_GENERATOR_DELIMITER = '::';

/**
 * Internal KeyGenerator function
 * @param keyGen
 * @param metadata
 * @param id
 */
export const _keyGenerator = (keyGen, { metadata, id }, delimeter = KEY_GENERATOR_DELIMITER) => {
  const prefix = keyGen({ metadata });
  const key = prefix ? `${delimeter}${id}` : id;
  return `${prefix}${key}`;
};

function isValidDelimiter(str) {
  return /[~!#$%&*_\-:<>?]/g.test(str);
}

export const validateDelimiter = (delimiter: string) => {
  if (delimiter.length > 2) {
    throw new BadKeyGeneratorDelimiterError(`keyGeneratorDelimiter only support up to 2 characters`);
  }

  if (!isValidDelimiter(delimiter)) {
    throw new BadKeyGeneratorDelimiterError(
      `Invalid keyGeneratorDelimiter value, the supported characters ~!#$%&*_-:<>?`,
    );
  }
};

export const DEFAULT_MAX_EXPIRY = 300000;
