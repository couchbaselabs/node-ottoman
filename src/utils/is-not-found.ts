import { DocumentNotFoundError } from 'couchbase';

/**
 * Return a boolean value is an exception is DocumentNotFoundError
 */
export const isDocumentNotFoundError = (exception): boolean => exception instanceof DocumentNotFoundError;
