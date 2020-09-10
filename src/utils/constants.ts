import { ModelMetadata } from '../model/interfaces/model-metadata.interface';

interface configOptions {
  collectionKey?: string;
  scopeKey?: string;
  defaultScope?: string;
  populateMaxDeep?: number;
  disableScopes?: boolean;
  keyGenerator?: (params: { metadata: ModelMetadata; id: any }) => string;
}
export const globalConfig = ({
  collectionKey,
  scopeKey,
  populateMaxDeep,
  disableScopes,
  defaultScope,
  keyGenerator,
}: configOptions = {}) => {
  collectionKey && (COLLECTION_KEY = collectionKey);
  scopeKey && (SCOPE_KEY = scopeKey);
  defaultScope && (DEFAULT_SCOPE = defaultScope);
  keyGenerator && (KEY_GENERATOR = keyGenerator);
  populateMaxDeep && (DEFAULT_POPULATE_MAX_DEEP = populateMaxDeep);
  disableScopes && (DISABLE_SCOPES = disableScopes);
};

export const getCollectionKey = (): string => COLLECTION_KEY;
export const getScopeKey = (): string => SCOPE_KEY;

/**
 * Default value for metadata key, to keep collection tracking
 * eg. This model new Model('User', schema, options), will generate documents -> document._type = 'User'
 */
export let COLLECTION_KEY = '_type';

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
export let DEFAULT_SCOPE = '_default';

/**
 * Default collection name
 */
export const DEFAULT_COLLECTION = '_default';

export let DEFAULT_POPULATE_MAX_DEEP = 1;

export let DISABLE_SCOPES = false;

export let KEY_GENERATOR = ({ metadata, id }) => `${metadata.scopeName}$${metadata.collectionName}::${id}`;

export const DEFAULT_MAX_EXPIRY = '300000';
