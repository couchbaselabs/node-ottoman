/**
 * Get a Model instance and return a javascript Object
 */
export const extractDataFromModel = (document) => {
  document._depopulate();
  return { ...document };
};
