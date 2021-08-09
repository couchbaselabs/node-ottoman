import { CouchbaseError, BucketNotFoundError, CollectionNotFoundError, ScopeNotFoundError } from '../../src';

export function parseError(e: CouchbaseError, info: any): void {
  const { message, cause } = e;
  const response: string = (cause as any)?.response ?? '';

  if (response.includes('scope_not_found') || e instanceof ScopeNotFoundError) {
    throw new ScopeNotFoundError(
      new Error(
        `${message}${message.includes('drop collection') ? ` '${info.collectionName}'` : ''}, scope '${
          info.scopeName
        }' not found`,
      ),
    );
  }
  if (response.includes('collection_not_found') || e instanceof CollectionNotFoundError) {
    throw new CollectionNotFoundError(
      new Error(`${message}, in scope '${info.scopeName}' collection '${info.collectionName}' not found`),
    );
  }
  if (e instanceof BucketNotFoundError) {
    throw new BucketNotFoundError(new Error(`failed to drop bucket, bucket '${info.bucketName}' not found`));
  }
  throw e;
}
