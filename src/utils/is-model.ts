/**
 * Determine if a given parameter is
 * a Model
 * or a document built with a Model.
 */
import { Document } from '../model/document';

export const isModel = (model): boolean => {
  if (!model) {
    return false;
  }
  return model instanceof Document || model.prototype instanceof Document;
};
