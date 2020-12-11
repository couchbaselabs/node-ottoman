import { ModelMetadata } from '../model/interfaces/model-metadata.interface';
import { batchProcessQueue } from './utils';
import { StatusExecution } from './types';
import { ModelTypes } from '../model/model.types';

/**
 * Async Function
 * Update all of the documents that match conditions from the collection
 * Allows to use some filters and other useful options
 *
 * @param documents List of documents to update
 * @param doc Fields to update.
 *
 * @return (GenericManyQueryResponse)[(/classes/queryresponse.html)]
 */
export const updateMany = (metadata: ModelMetadata) => async (documents: ModelTypes[], doc: Partial<ModelTypes>) => {
  return await batchProcessQueue(metadata)(documents, updateCallback, doc, 100);
};

/**
 * @ignore
 */
export const updateCallback = (
  document: ModelTypes,
  metadata: ModelMetadata,
  extra: Record<string, unknown>,
): Promise<StatusExecution> => {
  const model = metadata.ottoman.getModel(metadata.modelName);
  return model
    .updateById(document[metadata.ID_KEY], { ...document, ...extra })
    .then(() => {
      return Promise.resolve(new StatusExecution(document[metadata.ID_KEY], 'SUCCESS'));
    })
    .catch(() => {
      /* istanbul ignore next */
      return Promise.reject(new StatusExecution(document[metadata.ID_KEY], 'FAILED'));
    });
};
