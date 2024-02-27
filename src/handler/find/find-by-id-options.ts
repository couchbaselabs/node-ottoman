import { TransactionAttemptContext } from 'couchbase';

export class FindByIdOptions {
  transactionContext?: TransactionAttemptContext;
  select?: string | string[];
  populate?: string | string[];
  withExpiry?: boolean;
  transcoder?: any;
  timeout?: number;
  populateMaxDeep?: number;
  /**
   * Documents returned from queries with the `lean` option enabled are plain javascript objects, not Ottoman Documents. They have no save methods, hooks or other Ottoman Document's features.
   * @example
   * ```ts
   * const document = await UserModel.findById(id, { lean: true });
   * document instanceof Document; // false
   * ```
   **/
  lean?: boolean;
  enforceRefCheck?: boolean | 'throw';
  constructor(data: FindByIdOptions) {
    for (const key in data) {
      this[key] = data[key];
    }
  }
}
