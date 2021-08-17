import { isDebugMode } from '../is-debug-mode';

/**
 * Determine if a given field can be populated.
 */
export const canBePopulated = (populate: string, fields: string[]): boolean => {
  if (populate === '*' || fields.some((field) => populate === field || field === `\`${populate}\``)) {
    return true;
  }

  if (isDebugMode()) {
    console.warn(`Unable to populate field "${populate}", it is not available on select clause [${fields.join(', ')}]`);
  }
  return false;
};
