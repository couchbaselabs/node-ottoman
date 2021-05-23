import { ModelMetadata } from '../../interfaces/model-metadata.interface';

export const buildMapViewIndexFn = (metadata: ModelMetadata, fields) => {
  const { modelKey, modelName } = metadata;
  const docFields = fields.map((field) => `doc.${field}`);
  return `function (doc, meta) {
    if (doc.${modelKey} == "${modelName}") {
        emit([${docFields.join(',')}], null);
    }
  }`;
};
