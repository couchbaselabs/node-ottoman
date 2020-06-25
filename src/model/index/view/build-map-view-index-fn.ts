import { ModelMetadata } from '../../interfaces/model-metadata.interface';

export const buildMapViewIndexFn = (metadata: ModelMetadata, fields) => {
  const { collectionKey, collectionName, scopeKey, scopeName } = metadata;
  const docFields = fields.map((field) => `doc.${field}`);
  return `function (doc, meta) {
    if (doc.${scopeKey} == "${scopeName}" && doc.${collectionKey} == "${collectionName}") {
        emit([${docFields.join(',')}], null);
    }
}
  `;
};
