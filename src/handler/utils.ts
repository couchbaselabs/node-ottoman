import { ModelMetadata } from '../model/interfaces/model-metadata.interface';
import { ManyQueryResponse, ManyResponse, StatusExecution } from './types';

/**
 * @ignore
 */
export const chunkArray = (list, size) => {
  const clonedList = [...list];
  const results: any = [];
  while (clonedList.length) {
    results.push(clonedList.splice(0, size));
  }
  return results;
};

/**
 * @ignore
 */
function* processBatch(items, fn, metadata, extra, options): IterableIterator<Promise<StatusExecution>> {
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
export const batchProcessQueue =
  <T = any>(metadata: ModelMetadata) =>
  async (items: unknown[], fn: unknown, extra: Record<string, unknown> = {}, options: any = {}, throttle = 100) => {
    const chunks = chunkArray([...items], throttle);
    const result: ManyResponse<T> = { success: 0, match_number: items.length, errors: [], data: [] };
    for (const chunk of chunks) {
      const promises: Promise<StatusExecution>[] = [];
      for (const promise of processBatch(chunk, fn, metadata, extra, options)) {
        promises.push(promise);
      }
      const batchResults = await Promise.all(promises);
      for (const r of batchResults) {
        if (r.status === 'FAILURE') {
          result.errors.push(r);
        } else {
          result.success += 1;
          if (r.payload) {
            result.data?.push(r.payload as T);
          }
        }
      }
    }
    return new ManyQueryResponse<T>(result.errors.length > 0 ? 'FAILURE' : 'SUCCESS', result);
  };
