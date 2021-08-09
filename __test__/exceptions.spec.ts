import * as couchbase from 'couchbase';
import { DocumentNotFoundError, IndexExistsError } from '../src';

describe('exceptions test', () => {
  test('DocumentNotFoundError Exception Error', () => {
    expect(couchbase.DocumentNotFoundError.name).toBe(DocumentNotFoundError.name);
    expect(new DocumentNotFoundError()).toBeInstanceOf(couchbase.DocumentNotFoundError);
  });

  test('KeyValueErrorContext Exception Context', () => {
    expect(couchbase.IndexExistsError.name).toBe(IndexExistsError.name);
    expect(new IndexExistsError()).toBeInstanceOf(couchbase.IndexExistsError);
  });
});
