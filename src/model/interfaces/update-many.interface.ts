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
}
