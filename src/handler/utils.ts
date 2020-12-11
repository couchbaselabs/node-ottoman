import { ModelMetadata } from '../model/interfaces/model-metadata.interface';
import { GenericManyQueryResponse, StatusExecution } from './types';

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
function* processBatch(ids, fn, metadata): IterableIterator<StatusExecution> {
  const clonedIds = [...ids];
  for (const id of clonedIds) {
    yield fn(id, metadata)
      .then((result) => result)
      .catch((error) => error);
  }
}

/**
 * @ignore
 */
export const batchProcessQueue = (metadata: ModelMetadata) => async (ids, fn, throttle = 100) => {
  const chunks = chunkArray(ids, throttle);
  const chunkPromises = chunks.map((data) => Promise.resolve(data));
  const result: { success: number; errors: string[] } = { success: 0, errors: [] };
  for await (const chunk of chunkPromises) {
    try {
      for await (const r of processBatch(chunk, fn, metadata)) {
        if (r.status === 'FAILED') {
          result.errors.push(r.id);
        } else {
          result.success = result.success + 1;
        }
      }
    } catch (e) {
      throw e;
    }
  }
  return new GenericManyQueryResponse('SUCCESS', result);
};
