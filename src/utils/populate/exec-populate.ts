/**
 * Populate a given field through an array with references.
 */
export const execPopulation = (rows, toPopulate: string, collection): Promise<any[]> => {
  const promises: Promise<any>[] = [];
  for (const row of rows) {
    if (row[toPopulate]) {
      promises.push(collection.get(row[toPopulate]));
    } else {
      promises.push(Promise.resolve(null));
    }
  }
  return Promise.all(promises).then((refDocs) => {
    for (let i = 0; i < refDocs.length; i++) {
      rows[i][toPopulate] = refDocs[i].value || null;
    }
    return rows;
  });
};
