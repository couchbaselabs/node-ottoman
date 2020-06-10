/**
 * Determine if a given parameter is
 * a Model constructor
 * or a Model instance
 */

export const isModel = (model): boolean => {
  if (!model) {
    return false;
  }
  const name = typeof model === 'function' ? model.name : model.constructor.name;
  return name === '__ModelFactory__';
};
