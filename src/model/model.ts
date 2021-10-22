import { Document, IDocument } from './document';
import { FindByIdOptions, FindOptions, ManyQueryResponse } from '../handler';
import { IConditionExpr, LogicalWhereExpr, Query } from '../query';
import { UpdateManyOptions } from './interfaces/update-many.interface';
import { FindOneAndUpdateOption } from './interfaces/find.interface';
import { CastOptions, MutationFunctionOptions } from '../utils/cast-strategy';
import { ModelTypes, saveOptions } from './model.types';

//@ts-ignore
export class IModel<T = any, R = any> extends Document implements IModel<T, R> {}
/**
 * Constructor to build a model instance based on schema and options.
 * Provides methods to handle documents of the current collection in the database.
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

export interface IModel<T = any, R = any> {
  /**
   * Creates a document from this model.
   * Implements schema validations, defaults, methods, static and hooks
   */
  new (data: T, options?: CastOptions): IDocument<T>;

  /**
   * Finds documents.
   *
   * @example
   * ```javascript
   * User.find({ name: "Jane" })
   * // will return a list of all users with the name "Jane"
   *
   * User.find({ name: "Jane" }, { limit: 10 })
   * // will return a list of all users with the name "Jane" and limited to 10 items
   *
   * User.find({ name: "Jane" }, { ignoreCase: true })
   * // will return a list of all users with the name "Jane" ignoring case
   *
   * ```
   *
   * ```javascript
   * const filter = {
   * $or: [{ price: { $gt: 'amount_val', $isNotNull: true } }, { auto: { $gt: 10 } }, { amount: 10 }],
   * $and: [
   *   { price2: { $gt: 1.99, $isNotNull: true } },
   *   { $or: [{ price3: { $gt: 1.99, $isNotNull: true } }, { id: '20' }] },
   *   {name: { $eq: 'John', $ignoreCase: true }}
   *  ],
   * };
   * User.find(filter)
   * // Returns a list of the elements that match the applied filters.
   * ```
   */
  find<Doc = T>(filter?: LogicalWhereExpr<Doc>, options?: FindOptions): Promise<any>;

  /**
   * Returns the number of documents that match the query.
   *
   * @example
   * ```javascript
   * User.count({ name: { $like: "%Jane%" } })
   * ```
   */
  count(filter?: LogicalWhereExpr<T>): Promise<any>;

  /**
   * Retrieves a document by id.
   *
   * @example
   * ```javascript
   * User.findById('userId')
   * // will return the user document by id.
   *
   * User.findById('userId', {select: 'name, cards', populate: 'cards'})
   * // will return the user document by id with only the fields name, and cards populated.
   * ```
   */
  findById<Result = R>(id: string, options?: FindByIdOptions): Promise<Result>;
  findById<Result = R>(id: string, options?: FindByIdOptions): Promise<IDocument<Result>>;

  /**
   * Finds a document.
   *
   * @example
   * ```javascript
   * User.findOne({ name: "Jane" })
   * // will return a document with a User name of "Jane", or if it doesn't exist, throw a DocumentNotFoundError exception.
   *
   * User.findOne({ name: "Jane" }, { ignoreCase: true })
   * // will return a document with a User name of "Jane", ignoring the case.
   * ```
   */
  findOne<Doc = T, Result = R>(filter?: LogicalWhereExpr<Doc>, options?: FindOptions): Promise<Result>;
  findOne<Doc = T, Result = R>(filter?: LogicalWhereExpr<Doc>, options?: FindOptions): Promise<IDocument<Result>>;

  /**
   * Creates a new document.
   *
   * @example
   * ```javascript
   * const user = await User.create({ name: "John Doe" });
   * ```
   */
  create<Doc = T>(doc: Doc, options?: saveOptions): Promise<IDocument<T>>;

  /**
   * Creates many documents at once.
   *
   * The response status will be **SUCCESS** as long as no error occurs, otherwise it will be **FAILURE**.
   *
   * @example
   * ```javascript
   * const user = await User.createMany([{ name: "John Doe" }, { name: "Jane Doe" }]);
   * ```
   */
  createMany<Doc = T, Result = R>(docs: Doc[] | Doc): Promise<ManyQueryResponse<IDocument<Result>>>;

  /**
   * Updates a document.
   *
   * @example
   * ```typescript
   * const user = await User.updateById('userId', {name: "John Doe"});
   * ```
   *
   * @example Using updateById on immutable properties
   * ```typescript
   * const cardData = {
   *  cardNumber: '5678 5678 5678 5678',
   *  zipCode: '56789',
   * };
   *
   * const cardDataUpdate = {
   *  cardNumber: '4321 4321 4321 4321',
   *  zipCode: '43210',
   * };
   *
   * const CardSchema = new Schema({
   *  cardNumber: { type: String, immutable: true },
   *  zipCode: String,
   * });
   * const Card = model('Card', CardSchema);
   * const {id} = await Card.create(cardData);
   *
   * // with strategy:CAST_STRATEGY.THROW
   * await Card.updateById(id, cardDataUpdate, { strict: CAST_STRATEGY.THROW });
   * // ImmutableError: Field 'cardNumber' is immutable and current cast strategy is set to 'throw'
   *
   * // with strategy:true (default)
   * await Card.updateById(id, cardDataUpdate, { strict: true });
   * const result = await Card.findById(id);
   * console.log(result); // {cardNumber:'5678 5678 5678 5678', zipCode:'43210'} only zipCode was changed
   *
   * // with strategy:false
   * await Card.updateById(id, cardDataUpdate, { strict: false });
   * const result = await Card.findById(id);
   * console.log(result); // {cardNumber:'4321 4321 4321 4321', zipCode:'43210'} all properties were changed
   * ```
   *
   * @throws **ImmutableError** if updateById is strict:CAST_STRATEGY.THROW and try to modify a immutable property.
   */
  updateById<Doc = T, Result = R>(
    id: string,
    data: Doc | Partial<Doc> | IDocument<Doc>,
    options?: MutationFunctionOptions,
  ): Promise<Result>;

  updateById<Doc = T, Result = R>(
    id: string,
    data: Doc | Partial<Doc> | IDocument<Doc>,
    options?: MutationFunctionOptions,
  ): Promise<IDocument<Result>>;

  /**
   * Same as **updateById**, except it replaces the existing document with the given document.
   *
   * @example
   * ```javascript
   * const user = await User.replaceById('userId', {name: "John Doe"});
   * ```
   *
   * @example Using replaceById on immutable properties
   * ```typescript
   * const cardData = {
   *  cardNumber: '5678 5678 5678 5678',
   *  zipCode: '56789',
   * };
   *
   * const cardDataUpdate = {
   *  cardNumber: '4321 4321 4321 4321',
   *  zipCode: '43210',
   * };
   *
   * const CardSchema = new Schema({
   *  cardNumber: { type: String, immutable: true },
   *  zipCode: String,
   * });
   * const Card = model('Card', CardSchema);
   * const {id} = await Card.create(cardData);
   *
   * // with strategy:CAST_STRATEGY.THROW
   * await Card.replaceById(id, cardDataUpdate, { strict: CAST_STRATEGY.THROW });
   * // ImmutableError: Field 'cardNumber' is immutable and current cast strategy is set to 'throw'
   *
   * // with strategy:true (default)
   * await Card.replaceById(id, cardDataUpdate, { strict: true });
   * const result = await Card.findById(id);
   * console.log(result); // {cardNumber:'5678 5678 5678 5678', zipCode:'43210'} only zipCode was changed
   *
   * // with strategy:false
   * await Card.replaceById(id, cardDataUpdate, { strict: false });
   * const result = await Card.findById(id);
   * console.log(result); // {cardNumber:'4321 4321 4321 4321', zipCode:'43210'} all properties were changed
   * ```
   *
   * @throws **DocumentNotFoundError** if the document not exist.
   * @throws **ImmutableError** if replaceById is strict:CAST_STRATEGY.THROW and try to modify a immutable property.
   */
  replaceById<Doc = T, Result = R>(
    id: string,
    data: Doc | IDocument<Doc>,
    options?: MutationFunctionOptions,
  ): Promise<Result>;

  replaceById<Doc = T, Result = R>(
    id: string,
    data: Doc | IDocument<Doc>,
    options?: MutationFunctionOptions,
  ): Promise<IDocument<Result>>;

  /**
   * Removes a document by id.
   *
   * @example
   * ```javascript
   * const result = await User.removeById('userId');
   * ```
   */
  removeById(id: string): Promise<{ cas: any }>;

  /**
   * Creates a [document](/classes/document) from the given data.
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
  fromData(data: T | Partial<T>): ModelTypes<T>;

  /**
   * Deletes all of the documents that match conditions from the collection.
   *
   * The response status will be **SUCCESS** as long as no error occurs, otherwise it will be **FAILURE**.
   *
   * @example
   * ```javascript
   * const result = await User.removeMany({ name: { $like: '%John Doe%' } })
   * // Could also use:
   * const result = await User.removeMany({ name:'John Doe' }, { ignoreCase: true })
   * ```
   *
   * @param filter Filter Condition [Where Expression](/classes/query.html#where)
   * @param options [Find Options](/classes/findoptions.html#class-findoptions)
   *
   *
   */
  removeMany<Doc = T, Result = string>(
    filter?: LogicalWhereExpr<Doc>,
    options?: FindOptions,
  ): Promise<ManyQueryResponse<Result>>;

  /**
   * Updates all of the documents that match conditions from the collection.
   *
   * The response status will be **SUCCESS** as long as no error occurs, otherwise it will be **FAILURE**.
   *
   * @example
   * ```javascript
   * const result = await User.updateMany({ name: { $like: '%John Doe%' } })
   * ```
   *
   * @example Using immutable properties
   * ```typescript
   *
   *  // Function helper for example
   * async function updateManyHelper(result: any[], strict: ApplyStrategy = true) {
   *  // First define the schema
   *  const CardSchema = new Schema({
   *    cardNumber: String,
   *    zipCode: { type: String, immutable: true },
   *  });
   *
   *  //The model is created
   *  const Card = model('CardMany', CardSchema);
   *
   *  // Created elements are stored here
   *  let card1;
   *  let card2;
   *
   *  const batchCreate = async () => {
   *    card1 = await Card.create({ cardNumber: '5678 5678 1111 1111', zipCode: '11111' });
   *    card2 = await Card.create({ cardNumber: '5678 5678 2222 2222', zipCode: '22222' });
   *  };
   *
   *  // Create elements
   *  await batchCreate();
   *
   *  // Update by some criteria
   *  const response: IManyQueryResponse = await Card.updateMany(
   *       { cardNumber: { $like: '%5678 5678%' } },
   *       { zipCode: '12345', cardNumber: '0000 0000 0000 0000' },
   *       { strict },
   *    );
   *    const result1 = await Card.findById(card1.id);
   *    const result2 = await Card.findById(card2.id);
   *
   *    // Reset data before end test round
   *    const cleanUp = async () => await Card.removeMany({ _type: 'CardMany' });
   *    await cleanUp();
   *
   *    // Return results and response
   *    result.push(result1, result2, response);
   *  }
   *
   *  // Store data to check response on each round
   * let result: any[] = [];
   *
   * async function testRounds(){
   *
   *  // Round 1: updateMany with strategy:false
   *  await updateManyHelper(result, false);
   *  const [result1, result2, response] = result;
   *  console.log(result1);  // {"cardNumber":"0000 0000 0000 0000","zipCode":"12345"} both properties have been changed
   *  console.log(result2);  // {"cardNumber":"0000 0000 0000 0000","zipCode":"12345"} both properties have been changed
   *  console.log(response); // {"status":"SUCCESS","message":{"success":2,"match_number":2,"errors":[]}}
   *  result = [];
   *
   *  // Round 2: updateMany with strategy:true
   *  await updateManyHelper(result, true);
   *  const [result1, result2, response] = result;
   *  console.log(result1);  // {"cardNumber":"0000 0000 0000 0000","zipCode":"11111"} only cardNumber has changed
   *  console.log(result2);  // {"cardNumber":"0000 0000 0000 0000","zipCode":"22222"} only cardNumber has changed
   *  console.log(response); // {"status":"SUCCESS","message":{"success":2,"match_number":2,"errors":[]}}
   *  result = [];
   *
   *  // Round 3: updateMany with strategy:CAST_STRATEGY.THROW
   *  await updateManyHelper(result, CAST_STRATEGY.THROW);
   *  const [result1, result2, response] = result;
   *  console.log(result1);  // {"cardNumber":"5678 5678 1111 1111","zipCode":"11111"} only cardNumber has changed
   *  console.log(result2);  // {"cardNumber":"5678 5678 2222 2222","zipCode":"22222"} only cardNumber has changed
   *  console.log(response); // {"status":"SUCCESS","message":{"success":2,"match_number":2,"errors":[]}}
   *  result = [];
   *
   *  // RESPONSE FAILURE
   *  // {
   *  //   "status": "FAILURE",
   *  //   "message": {
   *  //       "success": 0,
   *  //       "match_number": 2,
   *  //       "errors": [
   *  //           {
   *  //               "status": "FAILURE",
   *  //               "exception": "ImmutableError",
   *  //               "message": "Field 'zipCode' is immutable and current cast strategy is set to 'throw'"
   *  //           },
   *  //           {
   *  //               "status": "FAILURE",
   *  //               "exception": "ImmutableError",
   *  //               "message": "Field 'zipCode' is immutable and current cast strategy is set to 'throw'"
   *  //           }
   *  //       ]
   *  //   }
   *  // }
   *  }
   * // Test rounds are run
   * testRounds();
   * ```
   *
   * @param filter Filter Condition [Where Expression](/classes/query.html#where)
   * @param doc Values for the fields to update
   * @param options [Update Many Options](/interfaces/updatemanyoptions.html)
   *
   */
  updateMany<Query = T, Result = T>(
    filter?: LogicalWhereExpr<Query>,
    doc?: T | Partial<T>,
    options?: UpdateManyOptions,
  ): Promise<ManyQueryResponse<IDocument<Result>>>;

  /**
   * Finds a document that matches the conditions of the collection and updates it.
   *
   * @example
   * ```javascript
   * const result = await User.findOneAndUpdate({ name: { $like: '%John Doe%' } }, { name: "John" })
   * ```
   *
   * @param filter Filter Condition [Where Expression](/classes/query.html#where)
   * @param doc Values for the fields to update
   * @param options [FindOneAndUpdateOptions](/interfaces/findoneandupdateoption.html)
   *
   *
   * Return a [Model](/classes/model.html) if at least one item matching the condition, otherwise an [exception](https://docs.couchbase.com/sdk-api/couchbase-node-client/classes/DocumentNotFoundError.html) will be thrown.
   * If options.new is **true** return the document after update otherwise by default return the document before update.
   * If options.upsert is **true** insert a document if the document does not exist.
   * options.strict used for strategy to apply on immutables properties
   *
   * @example Using findOneAndUpdate on immutable properties
   * ```typescript
   * const cardData = {
   *  cardNumber: '5678 5678 5678 5678',
   *  zipCode: '56789',
   * };
   *
   * const cardDataUpdate = {
   *  cardNumber: '4321 4321 4321 4321',
   *  zipCode: '43210',
   * };
   *
   * const CardSchema = new Schema({
   *  cardNumber: { type: String, immutable: true },
   *  zipCode: String,
   * });
   * const Card = model('Card', CardSchema);
   * const {id} = await Card.create(cardData);
   *
   * // with strategy:CAST_STRATEGY.THROW
   * await Card.findOneAndUpdate({ cardNumber: { $like: '%5678 5678 5678 5678%' } }, cardDataUpdate, {
   *   new: true,
   *   strict: CAST_STRATEGY.THROW,
   * });
   * // ImmutableError: Field 'cardNumber' is immutable and current cast strategy is set to 'throw'
   *
   * // with strategy:true (default)
   * await Card.findOneAndUpdate({ cardNumber: { $like: '%5678 5678 5678 5678%' } }, cardDataUpdate, {
   *   new: true,
   *   strict: true,
   * });
   * const result = await Card.findById(id);
   * console.log(result); // {cardNumber:'5678 5678 5678 5678', zipCode:'43210'} only zipCode was changed
   *
   * // with strategy:false
   * await Card.findOneAndUpdate({ cardNumber: { $like: '%5678 5678 5678 5678%' } }, cardDataUpdate, {
   *   new: true,
   *   strict: false,
   * });
   * const result = await Card.findById(id);
   * console.log(result); // {cardNumber:'4321 4321 4321 4321', zipCode:'43210'} all properties were changed
   * ```
   *
   * @throws **ImmutableError** if findOneAndUpdate is strict:CAST_STRATEGY.THROW and try to modify a immutable property.
   */
  findOneAndUpdate<Query = T, Result = R>(
    filter?: LogicalWhereExpr<Query>,
    doc?: T | Partial<T>,
    options?: FindOneAndUpdateOption,
  ): Promise<Result>;

  findOneAndUpdate<Query = T, Result = R>(
    filter?: LogicalWhereExpr<Query>,
    doc?: T | Partial<T>,
    options?: FindOneAndUpdateOption,
  ): Promise<IDocument<Result>>;

  /**
   * Finds a document that matches the conditions of the collection and remove it.
   *
   * @example
   * ```javascript
   * const result = await User.findOneAndRemove({ name: { $like: '%John Doe%' } })
   * ```
   *
   * @param filter Filter Condition [Where Expression](/classes/query.html#where)
   *
   */
  findOneAndRemove<Query = T, Result = R>(filter?: LogicalWhereExpr<Query>): Promise<Result>;
  findOneAndRemove<Query = T, Result = R>(filter?: LogicalWhereExpr<Query>): Promise<IDocument<Result>>;

  /**
   * Return a [Query](/classes/query) instance in the model context
   * @example
   * ```typescript
   * const query = User.query({name: 'John Smith'})
   * console.log(query.build())
   * // select * from `travel-sample`.`inventory`.`user` where name = 'John Smith'
   * ```
   */
  query(params: IConditionExpr): Query;

  /**
   * Return string value with the model context
   * @example
   * ```javascript
   * console.log(User.namespace)
   * // `travel-sample`.`inventory`.`user`
   * ```
   */
  namespace: string;

  /**
   * dropCollection drops a collection from a scope in a bucket.
   * @param collectionName
   * @param scopeName
   * @param options
   */
  dropCollection(
    collectionName?: string,
    scopeName?: string,
    options?: { timeout?: number },
  ): Promise<boolean | undefined>;
}
