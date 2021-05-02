/**
 * Populate a given field through an array with references.
 */

export const execPopulation = (rows, toPopulate: string, connection, modelName: string, deep?): Promise<any[]> => {
  const promises: Promise<any>[] = [];
  const l = rows.length;
  for (let i = 0; i < l; ++i) {
    const document = rows[i];
    if (document[toPopulate]) {
      promises.push(
        document._populate(toPopulate, deep).then((populated) => {
          rows[i] = populated;
        }),
      );
    }
  }
  return Promise.all(promises);
};

export const execPopulationFromObject = (rows, populate, deep?): Promise<any[]> => {
  const promises: Promise<any>[] = [];
  const l = rows.length;
  for (let i = 0; i < l; ++i) {
    const document = rows[i];
    promises.push(
      document._populate(populate, deep).then((populated) => {
        rows[i] = populated;
      }),
    );
  }
  return Promise.all(promises);
};
