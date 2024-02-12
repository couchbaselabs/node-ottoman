import { ModelMetadata } from '../model/interfaces/model-metadata.interface';
import { batchProcessQueue } from './utils';
import { ManyQueryResponse, StatusExecution } from './types';

/**
 * Async Function: Deletes all of the documents that match conditions from the collection.
 * Allows use of filters and options.
 *
 * @param ids List of documents to delete
 *
 * @return (ManyQueryResponse)[(/classes/queryresponse.html)]
 */
export const removeMany =
  (metadata: ModelMetadata) =>
  async (ids, options = {}): Promise<ManyQueryResponse> => {
    return await batchProcessQueue(metadata)(ids, removeCallback, {}, options, 100);
  };

/**
 * @ignore
 */
export const removeCallback = (id: string, metadata: ModelMetadata, extra, options): Promise<StatusExecution> => {
  const model = metadata.ottoman.getModel(metadata.modelName);

  return model
    .removeById(id, options)
    .then(() => {
      return Promise.resolve(new StatusExecution(id, 'SUCCESS'));
    })
    .catch((error) => {
      return Promise.reject(new StatusExecution(id, 'FAILURE', error.constructor.name, error.message));
    });
};
