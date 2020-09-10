/**
 * Populate a given field through an array with references.
 */

export const execPopulation = (rows, toPopulate: string, connection, modelName: string, deep?): Promise<any[]> => {
  const promises: Promise<any>[] = [];
  for (let i = 0; i < rows.length; i++) {
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
