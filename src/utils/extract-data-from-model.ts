/**
 * Get a Model instance and return a JavaScript Object.
 */
export const extractDataFromModel = (document) => {
  document._depopulate();
  return { ...document };
};
