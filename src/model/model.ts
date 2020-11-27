import { Document } from './document';
import { FindByIdOptions, FindOptions } from '../handler';
import { LogicalWhereExpr, SortType } from '../query';

type CountOptions = { sort?: Record<string, SortType>; limit?: number; skip?: number };

/**
 * Constructor to build a model instance based on a schema and other options.
 * Provides methods to handle documents of the current collection in the database
 *
 * @example
 * ```javascript
 * import { connect, model } from "ottoman";
 * connect("couchbase://localhost/travel-sample@admin:password");
 *
 * // Create an `User` model
 * const User = model('User', { name: String });
 * ```
 */
/* istanbul ignore file */
export abstract class Model<T = any> extends Document<T> {
  /**
   * Creates a document from this model.
   * Implements schema validations, defaults, methods, static and hooks
   */
  // eslint-disable-next-line no-unused-vars
  constructor(data: any) {
    super();
  }

  /**
   * Finds documents.
   *
   * @example
   * ```javascript
   * User.find({name: "Jane"})
   * // will return a list of all users with the name "Jane"
   *
   * User.find({name: "Jane"}, {limit: 10})
   * // will return a list of all users with the name "Jane" and limited to 10 items
   *
   * ```
   *
   * ```javascript
   * const filter = {
   * $or: [{ price: { $gt: 'amount_val', $isNotNull: true } }, { auto: { $gt: 10 } }, { amount: 10 }],
   * $and: [
   *   { price2: { $gt: 1.99, $isNotNull: true } },
   *   { $or: [{ price3: { $gt: 1.99, $isNotNull: true } }, { id: '20' }] },
   *  ],
   * };
   * User.find(filter)
   * // Returns a list of the elements that match the applied filters.
   * ```
   */
  // eslint-disable-next-line no-unused-vars
  static async find(filter: LogicalWhereExpr = {}, options: FindOptions = {}): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Returns the number of documents that match the query
   *
   * @example
   * ```javascript
   * User.count({name: {$like: "%Jane%"}})
   * ```
   */
  // eslint-disable-next-line no-unused-vars
  static async count(filter: LogicalWhereExpr = {}, options: CountOptions = {}): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Allows to retrieve a document by id
   *
   * @example
   * ```javascript
   * User.findById('userId')
   * // will return the user document with the current id.
   *
   * User.findById('userId', {select: 'name, cards', populate: 'cards'})
   * // will return the user document with the current id only with the fields name and cards populated
   * ```
   */
  // eslint-disable-next-line no-unused-vars
  static async findById(id: string, options: FindByIdOptions = {}): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Finds a document.
   *
   * @example
   * ```javascript
   * User.findOne({name: "Jane"})
   * // will return a document with a User with the name "Jane" or null in case of not finding it
   * ```
   */
  // eslint-disable-next-line no-unused-vars
  static async findOne(filter: LogicalWhereExpr = {}, options: { sort?: Record<string, SortType> } = {}): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Allows to create a new document
   *
   * @example
   * ```javascript
   * const user = await User.create({name: "John Doe"});
   * ```
   */
  // eslint-disable-next-line no-unused-vars
  static async create(data: Record<string, any>): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Allows to update a document
   *
   * @example
   * ```javascript
   * const user = await User.update({name: "John Doe"}, 'userId');
   * ```
   */
  // eslint-disable-next-line no-unused-vars
  static async update(data: any, id?: string): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Allows to replace a document
   *
   * @example
   * ```javascript
   * const user = await User.replace({name: "John Doe"}, 'userId');
   * ```
   */
  // eslint-disable-next-line no-unused-vars
  static async replace(data: any, id?: string): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Allows to remove a document
   *
   * @example
   * ```javascript
   * const result = await User.removeById('userId');
   * ```
   */
  // eslint-disable-next-line no-unused-vars
  static async removeById(id: string): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Creates a [document](/classes/document) from the given data
   * Result will be the same that -> new Model(data)
   *
   * @example
   * ```javascript
   * const user = User.fromData({name: "John Doe"});
   * // we create a `user` document, but it isn't saved yet.
   *
   * await user.save();
   * // Now user was persisted to DB
   * ```
   */
  // eslint-disable-next-line no-unused-vars
  static fromData(data): Model<any> {
    return data;
  }
}
