/**
 * Determine if a given parameter is
 * a Model
 * or a document built with a Model
 */
import { Model } from '../model/model';

export const isModel = (model): boolean => {
  if (!model) {
    return false;
  }
  return model instanceof Model || model.prototype instanceof Model;
};
