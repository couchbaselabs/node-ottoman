import { IFindOptions } from '../../handler';
import { MutationFunctionOptions } from '../../utils/cast-strategy';

/**
 * Update Many Options parameter
 * */
export interface UpdateManyOptions extends IFindOptions, MutationFunctionOptions {
  /** Default: false
   * if true, and no documents found, insert a new document.
   * */
  upsert?: boolean;

  /**
   * Default: false
   * enforceRefCheck will check if the referenced document exists
   * set to true: will log a warning message.
   * set to 'throw': will throw an exception.
   */
  enforceRefCheck?: boolean | 'throw';
}
