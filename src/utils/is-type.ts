import { Schema } from '../schema';

/**
 * Checking if a value is a specific type or constructor
 * @param val
 * @param type
 */
export const is = (val, type): boolean =>
  ![, null].includes(val) && (val.name === type.name || val.constructor.name === type.name);

export const isSchemaTypeSupported = (val): boolean => {
  return val.constructor['sName'] in Schema.Types;
};

export const isSchemaFactoryType = (value, factory): boolean => {
  return value.name in factory;
};
