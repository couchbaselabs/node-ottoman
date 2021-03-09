import { ValidationError } from '../schema';

export const set = (key: string, value: number | string | boolean) => {
  const valueType = typeof value;
  if (typeof value === 'string' && key) {
    process.env[key] = value;
  } else if ((valueType === 'boolean' || valueType === 'number') && key) {
    process.env[key] = String(value);
  } else {
    if (!key) {
      throw new ValidationError('set first argument required a valid string value');
    }
    throw new ValidationError('set second argument must be number | string | boolean value');
  }
};
