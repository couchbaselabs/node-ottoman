import { ModelMetadata } from '../model/interfaces/model-metadata.interface';
import { batchProcessQueue } from './utils';
import { ManyQueryResponse, StatusExecution } from './types';
import { ModelTypes } from '../model/model.types';
import { MutationFunctionOptions } from '../utils/cast-strategy';

/**
 * Async Function: Update all of the documents that match conditions from the collection.
 * Allows use of filters and options.
 *
 * @param documents List of documents to update
 * @param doc Fields to update.
 *
 * @return (ManyQueryResponse)[(/classes/queryresponse.html)]
 */
export const updateMany = (metadata: ModelMetadata) => async (
  documents: ModelTypes[],
  doc: Partial<ModelTypes>,
  options: MutationFunctionOptions,
): Promise<ManyQueryResponse> => {
  async function cb(document: ModelTypes, metadata: ModelMetadata, extra: Record<string, unknown>) {
    return updateCallback(document, metadata, extra, options);
  }
  return await batchProcessQueue(metadata)(documents, cb, doc, options, 100);
};

/**
 * @ignore
 */
export const updateCallback = (
  document: ModelTypes,
  metadata: ModelMetadata,
  extra: Record<string, unknown>,
  options: MutationFunctionOptions,
): Promise<StatusExecution> => {
  const model = metadata.ottoman.getModel(metadata.modelName);
  return model
    .updateById(document[metadata.ID_KEY], { ...document, ...extra }, options)
    .then((updated) => {
      return Promise.resolve(new StatusExecution(updated, 'SUCCESS'));
    })
    .catch((error) => {
      return Promise.reject(
        new StatusExecution(document[metadata.ID_KEY], 'FAILURE', error.constructor.name, error.message),
      );
    });
};
