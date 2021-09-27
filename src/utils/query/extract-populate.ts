import { FindOptions } from '../../handler';

/**
 * Extract the values to be populated.
 */
export const extractPopulate = (populate: FindOptions['populate']): string[] => {
  let populateFields: string[] = Array.isArray(populate) ? populate : [];

  if (populate && typeof populate === 'string') {
    populateFields = populate.trim().split(/\s*,\s*/g);
  }

  return [...new Set(populateFields)];
};
