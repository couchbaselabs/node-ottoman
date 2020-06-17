/**
 * Determine if a given field can be populated.
 */
export const canBePopulated = (populate: string, fields: string[]): boolean => {
  if (fields.includes(populate)) {
    return true;
  }

  console.warn(`Unable to populate field "${populate}", it is not available on select clause [${fields.join(', ')}]`);
  return false;
};
