/**
 * Get a Model instance and return javascript Object
 */
export const extractDataFromModel = (document) => {
  document._depopulate();
  return { ...document };
};
