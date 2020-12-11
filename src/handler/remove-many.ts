import { ModelMetadata } from '../model/interfaces/model-metadata.interface';
import { batchProcessQueue } from './utils';
import { StatusExecution } from './types';

export const removeMany = (metadata: ModelMetadata) => async (ids) => {
  return await batchProcessQueue(metadata)(ids, removeCallback, 100);
};

export const removeCallback = (id, metadata): Promise<StatusExecution> => {
  const model = metadata.ottoman.getModel(metadata.modelName);
  return model
    .removeById(id)
    .then(() => {
      return Promise.resolve(new StatusExecution(id, 'SUCCESS'));
    })
    .catch(() => {
      return Promise.reject(new StatusExecution(id, 'FAILED'));
    });
};
