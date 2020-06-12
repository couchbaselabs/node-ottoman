/**
 * Determine if a given field can be populated.
 */
export const canBePopulated = (populate: string, fields: string[]): boolean => {
  if (fields.includes(populate)) {
    return true;
  }
  throw new Error(`Unable to populate field "${populate}", it's not available on select clause [${fields.join(', ')}]`);
};
