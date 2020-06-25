export const buildMapViewIndexFn = (collectionKey, collectionName, fields) => {
  const docFields = fields.map((field) => `doc.${field}`);
  return `function (doc, meta) {
    if (doc.${collectionKey} == "${collectionName}") {
        emit([${docFields.join(',')}], null);
    }
}
  `;
};
