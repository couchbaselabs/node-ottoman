import { PopulateFieldsType } from '../../model/populate.types';
import { ISelectType, SortType } from '../../query';
import { SearchConsistency } from '../../utils/search-consistency';
import { TransactionAttemptContext } from 'couchbase';

export class FindOptions implements IFindOptions {
  skip?: number;
  limit?: number;
  sort?: Record<string, SortType>;
  populate?: PopulateFieldsType;
  populateMaxDeep?: number;
  select?: ISelectType[] | string | string[];
  consistency?: SearchConsistency;
  noCollection?: boolean;
  /**
   * Documents returned from queries with the `lean` option enabled are plain javascript objects, not Ottoman Documents. They have no save methods, hooks or other Ottoman Document's features.
   * @example
   * ```ts
   * const document = await UserModel.findById(id, { lean: true });
   * document instanceof Document; // false
   * ```
   **/
  lean?: boolean;
  ignoreCase?: boolean;
  enforceRefCheck?: boolean | 'throw';
  transactionContext?: TransactionAttemptContext;
  constructor(data: FindOptions) {
    for (const key in data) {
      this[key] = data[key];
    }
  }
}

export interface IFindOptions {
  skip?: number;
  limit?: number;
  sort?: Record<string, SortType>;
  populate?: PopulateFieldsType;
  populateMaxDeep?: number;
  select?: ISelectType[] | string | string[];
  consistency?: SearchConsistency;
  noCollection?: boolean;
  lean?: boolean;
  ignoreCase?: boolean;
}
