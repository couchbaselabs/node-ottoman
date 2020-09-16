/**
 * Determine if a given field can be populated.
 */
export const canBePopulated = (populate: string, fields: string[]): boolean => {
  if (fields && fields.length > 0 && fields[0] !== '*') {
    if (fields.includes(populate)) {
      return true;
    }

    if (!process.env.CI || (process.env.CI && process.env.CI.toLowerCase() !== 'true')) {
      console.warn(
        `Unable to populate field "${populate}", it is not available on select clause [${fields.join(', ')}]`,
      );
    }
    return false;
  }
  return true;
};
