/**
 * Populate a given field through an array with references.
 */

export const execPopulation = (
  rows,
  toPopulate: string,
  connection,
  modelName: string,
  deep?,
  lean = false,
): Promise<any[]> => {
  const promises: Promise<any>[] = [];
  const l = rows.length;
  for (let i = 0; i < l; ++i) {
    const document = rows[i];
    if (document[toPopulate] || toPopulate === '*') {
      document.$.lean = lean;
      promises.push(
        document._populate(toPopulate, deep).then((populated) => {
          rows[i] = populated;
          delete document.$.lean;
        }),
      );
    }
  }
  return Promise.all(promises);
};

export const execPopulationFromObject = (rows, populate, deep?, lean = false): Promise<any[]> => {
  const promises: Promise<any>[] = [];
  const l = rows.length;
  for (let i = 0; i < l; ++i) {
    const document = rows[i];
    document.$.lean = lean;
    promises.push(
      document._populate(populate, deep).then((populated) => {
        rows[i] = populated;
        delete document.$.lean;
      }),
    );
  }
  return Promise.all(promises);
};
