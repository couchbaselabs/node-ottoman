import { DocumentNotFoundError } from 'couchbase';

/**
 * Return a boolean value if an exception is DocumentNotFoundError.
 */
export const isDocumentNotFoundError = (exception: any): boolean => exception instanceof DocumentNotFoundError;
