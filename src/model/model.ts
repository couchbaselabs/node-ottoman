import { Document } from './document';
/**
 * Constructor to build a model instance based on schema and other options
 * Provide methods to handle documents of the current collection in the database
 */
export abstract class Model<T = any> extends Document<T> {
  /**
   * Create a document from this model
   * Implement schema validations, defaults, methods, statics, hooks
   */
  // eslint-disable-next-line no-unused-vars
  constructor(data: any) {
    super();
  }
}
