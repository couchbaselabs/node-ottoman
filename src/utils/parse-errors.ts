import { BucketNotFoundError, CollectionNotFoundError, CouchbaseError, ScopeNotFoundError } from 'couchbase';

export function parseError(e: CouchbaseError, info: any): void {
  const { message, context } = e;
  console.log(`ERROR: `, e);
  console.log(`MESSAGE: ${JSON.stringify(message)}`);

  if (e instanceof ScopeNotFoundError) {
    e.message = `failed to drop scope, scope '${info.scopeName}' not found`;
  }
  if (e instanceof CollectionNotFoundError) {
    e.message = `failed to drop collection, in scope '${info.scopeName}' collection '${info.collectionName}' not found`;
  }
  if (e instanceof BucketNotFoundError) {
    e.message = `failed to drop bucket, bucket '${info.bucketName}' not found`;
  }
  if (message === 'failed to drop collection' && (context as any)?.response_body?.includes('scope_not_found')) {
    e.message = `failed to drop collection '${info.collectionName}', scope '${info.scopeName}' not found`;
  }
  throw e;
}
