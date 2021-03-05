import { IFindOptions } from '../../handler';
import { MutationFunctionOptions } from '../../utils/cast-strategy';

/**
 * Find One and Update Options parameter
 * */
export interface FindOneAndUpdateOption extends IFindOptions, MutationFunctionOptions {
  /** Default: false
   * if true, and no documents found, insert a new document.
   * */
  upsert?: boolean;
  /** Default: false
   * if true, return a document after update otherwise return the document before update.
   * */
  new?: boolean;
}
