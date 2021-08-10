import couchbase from 'couchbase';
import { DocumentNotFoundError, KeyValueErrorContext } from '../src';

describe('exceptions test', () => {
  test('DocumentNotFoundError Exception Error', () => {
    expect(couchbase.DocumentNotFoundError.name).toBe(DocumentNotFoundError.name);
    expect(new DocumentNotFoundError()).toBeInstanceOf(couchbase.DocumentNotFoundError);
  });

  test('KeyValueErrorContext Exception Context', () => {
    expect(couchbase.KeyValueErrorContext.name).toBe(KeyValueErrorContext.name);
    expect(new KeyValueErrorContext()).toBeInstanceOf(couchbase.KeyValueErrorContext);
  });
});
