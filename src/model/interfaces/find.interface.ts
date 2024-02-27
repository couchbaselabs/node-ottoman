import { IFindOptions } from '../../handler';
import { MutationFunctionOptions } from '../../utils/cast-strategy';
import { TransactionAttemptContext } from '../../couchbase';

/**
 * Find One and Update Option parameter.
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
  maxExpiry?: number;
  /**
   * Default: false
   * enforceRefCheck will check if the referenced document exists
   * set to true: will log a warning message.
   * set to 'throw': will throw an exception.
   */
  enforceRefCheck?: boolean | 'throw';
  transactionContext?: TransactionAttemptContext;
}
