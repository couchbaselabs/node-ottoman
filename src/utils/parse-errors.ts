import * as couchbase from 'couchbase';
import { BucketNotFoundError, CollectionNotFoundError, ScopeNotFoundError } from '../exceptions/ottoman-errors';

export function parseError(e: couchbase.CouchbaseError, info: any): void {
  const { message, cause } = e;
  const response: string = cause?.response ?? '';

  if (response.includes('scope_not_found') || e instanceof couchbase.ScopeNotFoundError) {
    throw new ScopeNotFoundError(
      `${message}${message.includes('drop collection') ? ` '${info.collectionName}'` : ''}, scope '${
        info.scopeName
      }' not found`,
    );
  }
  if (response.includes('collection_not_found') || e instanceof couchbase.CollectionNotFoundError) {
    throw new CollectionNotFoundError(
      `${message}, in scope '${info.scopeName}' collection '${info.collectionName}' not found`,
    );
  }
  if (e instanceof couchbase.BucketNotFoundError) {
    throw new BucketNotFoundError(`failed to drop bucket, bucket '${info.bucketName}' not found`);
  }
  throw new couchbase.CouchbaseError(message);
}
