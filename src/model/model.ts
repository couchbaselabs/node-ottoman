import { Document } from './document';
import { FindByIdOptions, FindOptions, ManyQueryResponse } from '../handler';
import { LogicalWhereExpr, SortType } from '../query';
import { UpdateManyOptions } from './interfaces/update-many.interface';
import { FindOneAndUpdateOption } from './interfaces/find.interface';
import { CAST_STRATEGY } from '../utils/cast-strategy';

export type CountOptions = {
  sort?: Record<string, SortType>;
  limit?: number;
  skip?: number;
};

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
  constructor(data: unknown, options: { strategy?: CAST_STRATEGY; strict?: boolean; skip?: string[] } = {}) {
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
  static async findOne(filter: LogicalWhereExpr = {}, options: FindOptions = {}): Promise<any> {
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
  static async create(doc: Record<string, any>): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Allows to create many document at once.
   *
   * The response status will be **SUCCESS** as long as no error occurs, otherwise it will be **FAILURE**.
   *
   * @example
   * ```javascript
   * const user = await User.createMany([{name: "John Doe"}, {name: "Jane Doe"}]);
   * ```
   */
  // eslint-disable-next-line no-unused-vars
  static async createMany(docs: Record<string, any>[] | Record<string, any>): Promise<ManyQueryResponse> {
    return Promise.resolve(new ManyQueryResponse('SUCCESS', { success: 0, errors: [], match_number: docs.length }));
  }

  /**
   * Allows to update a document
   *
   * @example
   * ```javascript
   * const user = await User.updateById('userId', {name: "John Doe"});
   * ```
   */
  // eslint-disable-next-line no-unused-vars
  static async updateById(id: string, data: any): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Same as **updateById**,except replace the existing document with the given document.
   *
   * @example
   * ```javascript
   * const user = await User.replaceById('userId', {name: "John Doe"});
   * ```
   *
   * @throws DocumentNotFoundError if the document not exist.
   */
  // eslint-disable-next-line no-unused-vars
  static async replaceById(id: string, data: any): Promise<any> {
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

  /**
   * Deletes all of the documents that match conditions from the collection.
   *
   * The response status will be **SUCCESS** as long as no error occurs, otherwise it will be **FAILURE**.
   *
   * @example
   * ```javascript
   * const result = await User.removeMany({ name: { $like: '%John Doe%' } })
   * ```
   *
   * @param filter Filter Condition [Where Expression](/classes/query.html#where)
   * @param options [Find Options](/classes/findoptions.html#class-findoptions)
   *
   *
   */
  // eslint-disable-next-line no-unused-vars
  static async removeMany(filter: LogicalWhereExpr = {}, options: FindOptions = {}): Promise<ManyQueryResponse> {
    return Promise.resolve(new ManyQueryResponse('SUCCESS', { success: 0, errors: [], match_number: 0 }));
  }

  /**
   * Update all of the documents that match conditions from the collection.
   *
   * The response status will be **SUCCESS** as long as no error occurs, otherwise it will be **FAILURE**.
   *
   * @example
   * ```javascript
   * const result = await User.updateMany({ name: { $like: '%John Doe%' } })
   * ```
   *
   * @param filter Filter Condition [Where Expression](/classes/query.html#where)
   * @param doc Values for the fields to update.
   * @param options [Update Many Options](/interfaces/updatemanyoptions.html)
   *
   */
  static async updateMany(
    // eslint-disable-next-line no-unused-vars
    filter: LogicalWhereExpr = {},
    doc: Record<string, unknown>,
    // eslint-disable-next-line no-unused-vars
    options: UpdateManyOptions = {},
  ): Promise<ManyQueryResponse> {
    return Promise.resolve(new ManyQueryResponse('SUCCESS', { success: 0, errors: [], match_number: 0 }));
  }

  /**
   * Finds a document that matches the conditions of the collection and updates it.
   *
   * @example
   * ```javascript
   * const result = await User.findOneAndUpdate({ name: { $like: '%John Doe%' } }, { name: "John" })
   * ```
   *
   * @param filter Filter Condition [Where Expression](/classes/query.html#where)
   * @param doc Values for the fields to update.
   * @param options [FindOneAndUpdateOptions](/interfaces/findoneandupdateoption.html)
   *
   *
   * Return a [Model](/classes/model.html) if at least one item matching the condition, otherwise an [exception](https://docs.couchbase.com/sdk-api/couchbase-node-client/DocumentNotFoundError.html) will be thrown.
   * If options.new is **true** return the document after update otherwise by default return the document before update.
   * If options.upsert is **true** insert a document if the document does not exist.
   *
   *
   */
  static async findOneAndUpdate(
    // eslint-disable-next-line no-unused-vars
    filter: LogicalWhereExpr = {},
    doc: Record<string, unknown>,
    // eslint-disable-next-line no-unused-vars
    options: FindOneAndUpdateOption = {},
  ): Promise<any> {
    return Promise.resolve({});
  }
}
