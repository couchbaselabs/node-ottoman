import { ModelMetadata } from '../model/interfaces/model-metadata.interface';
import { GenericManyQueryResponse, GenericManyResponse, StatusExecution } from './types';

/**
 * @ignore
 */
export const chunkArray = (list, size) => {
  const results: any = [];
  while (list.length) {
    results.push(list.splice(0, size));
  }
  return results;
};

/**
 * @ignore
 */
function* processBatch(items, fn, metadata, extra): IterableIterator<StatusExecution> {
  const clonedItems = [...items];
  for (const items of clonedItems) {
    yield fn(items, metadata, extra)
      .then((result) => result)
      .catch((error) => error);
  }
}

/**
 * @ignore
 */
export const batchProcessQueue = (metadata: ModelMetadata) => async (
  items: unknown[],
  fn: unknown,
  extra: Record<string, unknown> = {},
  throttle = 100,
) => {
  const chunks = chunkArray([...items], throttle);
  const chunkPromises = chunks.map((data) => Promise.resolve(data));
  const result: GenericManyResponse = { modified: 0, match_number: items.length, errors: [] };
  for await (const chunk of chunkPromises) {
    try {
      for await (const r of processBatch(chunk, fn, metadata, extra)) {
        if (r.status === 'FAILED') {
          result.errors.push(r.id);
        } else {
          result.modified = result.modified + 1;
        }
      }
    } catch (e) {
      throw e;
    }
  }
  return new GenericManyQueryResponse(result.modified === 0 ? 'FAILED' : 'SUCCESS', result);
};
