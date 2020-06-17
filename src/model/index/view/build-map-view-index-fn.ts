import { COLLECTION_KEY } from '../../../utils/constants';

export const buildMapViewIndexFn = (collectionName, fields) => {
  const docFields = fields.map((field) => `doc.${field}`);
  return `function (doc, meta) {
    if (doc.${COLLECTION_KEY} == "${collectionName}") {
        emit([${docFields.join(',')}], null);
    }
}
  `;
};
