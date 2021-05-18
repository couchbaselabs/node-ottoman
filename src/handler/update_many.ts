import { ModelMetadata } from '../model/interfaces/model-metadata.interface';
import { batchProcessQueue } from './utils';
import { ManyQueryResponse, StatusExecution } from './types';
import { ModelTypes } from '../model/model.types';
import { ApplyStrategy } from '../utils/cast-strategy';

/**
 * Async Function
 * Update all of the documents that match conditions from the collection
 * Allows to use some filters and other useful options
 *
 * @param documents List of documents to update
 * @param doc Fields to update.
 *
 * @return (ManyQueryResponse)[(/classes/queryresponse.html)]
 */
export const updateMany = (metadata: ModelMetadata) => async (
  documents: ModelTypes[],
  doc: Partial<ModelTypes>,
  strict: ApplyStrategy,
): Promise<ManyQueryResponse> => {
  async function cb(document: ModelTypes, metadata: ModelMetadata, extra: Record<string, unknown>) {
    return updateCallback(document, metadata, extra, strict);
  }
  return await batchProcessQueue(metadata)(documents, cb, doc, 100);
};

/**
 * @ignore
 */
export const updateCallback = (
  document: ModelTypes,
  metadata: ModelMetadata,
  extra: Record<string, unknown>,
  strict: ApplyStrategy = true,
): Promise<StatusExecution> => {
  const model = metadata.ottoman.getModel(metadata.modelName);
  return model
    .updateById(document[metadata.ID_KEY], { ...document, ...extra }, { strict })
    .then((updated) => {
      return Promise.resolve(new StatusExecution(updated, 'SUCCESS'));
    })
    .catch((error) => {
      return Promise.reject(
        new StatusExecution(document[metadata.ID_KEY], 'FAILURE', error.constructor.name, error.message),
      );
    });
};
