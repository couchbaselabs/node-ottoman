import { ModelMetadata } from '../model/interfaces/model-metadata.interface';
import { batchProcessQueue } from './utils';
import { GenericManyQueryResponse, StatusExecution } from './types';

/**
 * Async Function
 * Deletes all of the documents that match conditions from the collection
 * Allows to use some filters and other useful options
 *
 * @param ids List of ids of the documents to delete
 *
 * @return (GenericManyQueryResponse)[(/classes/queryresponse.html)]
 */
export const removeMany = (metadata: ModelMetadata) => async (ids): Promise<GenericManyQueryResponse> => {
  return await batchProcessQueue(metadata)(ids, removeCallback, {}, 100);
};

/**
 * @ignore
 */
export const removeCallback = (id: string, metadata: ModelMetadata): Promise<StatusExecution> => {
  const model = metadata.ottoman.getModel(metadata.modelName);

  return model
    .removeById(id)
    .then(() => {
      return Promise.resolve(new StatusExecution(id, 'SUCCESS'));
    })
    .catch(() => {
      /* istanbul ignore next */
      return Promise.resolve(new StatusExecution(id, 'FAILED'));
    });
};
