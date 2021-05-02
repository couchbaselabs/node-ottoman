import { FindOptions } from '../../handler';

/**
 * Extract the values to be populated.
 */
export const extractPopulate = (populate: FindOptions['populate']): string[] => {
  let populateFields: string[] = [];

  if (populate) {
    if (Array.isArray(populate)) {
      populateFields = populate;
    } else if (typeof populate === 'string') {
      populateFields = populate.trim().replace(/,/g, ' ').replace(/\s+/g, ' ').split(' ');
    }
  }

  return [...new Set(populateFields)];
};
