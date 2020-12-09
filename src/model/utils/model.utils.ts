import { ModelMetadata } from '../interfaces/model-metadata.interface';

export const modelMetadataSymbol = Symbol('modelMetadataSymbol');
export const getModelMetadata = (modelConstructor): ModelMetadata => modelConstructor[modelMetadataSymbol];
export const setModelMetadata = (modelConstructor, metadata: ModelMetadata) =>
  (modelConstructor[modelMetadataSymbol] = metadata);
