/**
 * Checking if a value is a specific type or constructor
 * @param val
 * @param type
 */
export const is = (val, type): boolean =>
  ![, null].includes(val) && (val.name === type.name || val.constructor === type);

export const isTypeOf = (val, type): boolean => ![, null].includes(val) && val.name === type.name;
