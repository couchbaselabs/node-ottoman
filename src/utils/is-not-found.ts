import couchbase from 'couchbase';

/**
 * Return a boolean value if an exception is DocumentNotFoundError.
 */
export const isDocumentNotFoundError = (exception): boolean =>
  exception instanceof (couchbase as any).DocumentNotFoundError;
