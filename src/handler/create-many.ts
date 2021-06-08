import { ModelMetadata } from '../model/interfaces/model-metadata.interface';
import { batchProcessQueue } from './utils';
import { StatusExecution } from './types';
import { ModelTypes } from '../model/model.types';

/**
 * Async Function: Create many documents at once
 *
 * @param documents List of documents to create
 *
 * @return (ManyQueryResponse)[(/classes/queryresponse.html)]
 */
export const createMany = <T = any>(metadata: ModelMetadata) => async (documents: unknown[]) => {
  return await batchProcessQueue(metadata)(documents, createManyCallback, {}, 100);
};

/**
 * @ignore
 */
export const createManyCallback = (document: ModelTypes, metadata: ModelMetadata): Promise<StatusExecution> => {
  const Model = metadata.ottoman.getModel(metadata.modelName);
  return Model.create(document)
    .then((created) => {
      return Promise.resolve(new StatusExecution(created, 'SUCCESS'));
    })
    .catch((error) => {
      /* istanbul ignore next */
      return Promise.reject(new StatusExecution(document, 'FAILURE', error.constructor.name, error.message));
    });
};
