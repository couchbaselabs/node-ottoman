import { IFindOptions } from '../../handler';

/**
 * Update Many Options parameter
 * */
export interface UpdateManyOptions extends IFindOptions {
  /** Default: false
   * if true, and no documents found, insert a new document.
   * */
  upsert?: boolean;
}
