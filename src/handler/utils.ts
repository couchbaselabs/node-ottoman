import { ModelMetadata } from '../model/interfaces/model-metadata.interface';
import { ManyQueryResponse, ManyResponse, StatusExecution } from './types';

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
function* processBatch(items, fn, metadata, extra, options): IterableIterator<StatusExecution> {
  const clonedItems = [...items];
  for (const items of clonedItems) {
    yield fn(items, metadata, extra, options)
      .then((result) => result)
      .catch((error) => error);
  }
}

/**
 * @ignore
 */
export const batchProcessQueue = <T = any>(metadata: ModelMetadata) => async (
  items: unknown[],
  fn: unknown,
  extra: Record<string, unknown> = {},
  options: any = {},
  throttle = 100,
) => {
  const chunks = chunkArray([...items], throttle);
  const chunkPromises = chunks.map((data) => Promise.resolve(data));
  const result: ManyResponse<T> = { success: 0, match_number: items.length, errors: [], data: [] };
  for await (const chunk of chunkPromises) {
    for await (const r of processBatch(chunk, fn, metadata, extra, options)) {
      if (r.status === 'FAILURE') {
        result.errors.push(r);
      } else {
        result.success = result.success + 1;
        if (r.payload) {
          result.data?.push(r.payload as T);
        }
      }
    }
  }
  return new ManyQueryResponse<T>(result.errors.length > 0 ? 'FAILURE' : 'SUCCESS', result);
};
