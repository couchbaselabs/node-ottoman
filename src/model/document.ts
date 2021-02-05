import { DocumentExistsError, DocumentNotFoundError } from '../exceptions/exceptions';
import { extractDataFromModel } from '../utils/extract-data-from-model';
import { generateUUID } from '../utils/generate-uuid';
import { validate } from '../schema';
import { ModelMetadata } from './interfaces/model-metadata.interface';
import { getModelMetadata } from './utils/model.utils';
import { storeLifeCycle } from './utils/store-life-cycle';
import { removeLifeCycle } from './utils/remove-life-cycle';
import { arrayDiff } from './utils/array-diff';
import { getModelRefKeys } from './utils/get-model-ref-keys';
import { extractSchemaReferencesFields, extractSchemaReferencesFromGivenFields } from '../utils/schema.utils';
import { _keyGenerator } from '../utils/constants';

/**
 * Document class represent a database document
 * and provide some useful methods to work with.
 *
 * @example
 * ```javascript
 * import { connect, model } from "ottoman";
 * connect("couchbase://localhost/travel-sample@admin:password");
 *
 * // Create an `User` model
 * const User = model('User', { name: String });
 *
 * // Create a document from the `User` Model
 * const jane = new User({name: "Jane Doe"})
 * ```
 */
export abstract class Document<T> {
  /**
   * @ignore
   */
  [key: string]: any;

  /**
   * @ignore
   */
  get $(): ModelMetadata {
    return getModelMetadata(this.constructor);
  }
  /**
   * Returns id value, useful when working with dynamic ID_KEY
   *
   * @example
   * ```javascript
   *   console.log(user._getId()); // 'userId'
   *   console.log(user.id); // 'userId'
   * ```
   */
  _getId(): string {
    return this[this.$.ID_KEY];
  }

  /**
   * Returns id key
   */
  _getIdField(): string {
    return this.$.ID_KEY;
  }

  /**
   * Saves or Updates the document
   *
   * @example
   * ```javascript
   * const user = new User({name: "John Doe"}); //user document created, it's not saved yet
   *
   * await user.save(); // user saved into the DB
   *
   * You also can force save function to only create new Documents by passing true as argument
   * await user.save(true); // ensure to execute a insert operation
   * ```
   */
  async save(onlyCreate = false) {
    const { scopeName, collectionName, modelKey, collection, keyGenerator, modelName, ottoman } = this.$;
    const data = extractDataFromModel(this);
    const options: any = {};
    let id = this._getId();
    const prefix = `${scopeName}${collectionName}`;
    const newRefKeys = getModelRefKeys(data, prefix, ottoman);
    const refKeys: { add: string[]; remove: string[] } = {
      add: [],
      remove: [],
    };
    const metadata = this.$;
    let key = '';
    if (!id) {
      id = generateUUID();
      key = _keyGenerator!(keyGenerator, { metadata, id });
      if (!data[this._getIdField()]) {
        data[this._getIdField()] = id;
      }
      refKeys.add = newRefKeys;
    } else {
      try {
        key = _keyGenerator!(keyGenerator, { metadata, id });
        const { cas, value: oldData } = await collection().get(key);
        if (cas && onlyCreate) {
          throw new DocumentExistsError();
        }
        const oldRefKeys = getModelRefKeys(oldData, prefix, ottoman);
        refKeys.add = arrayDiff(newRefKeys, oldRefKeys);
        refKeys.remove = arrayDiff(oldRefKeys, newRefKeys);
        if (cas) {
          options.cas = cas;
        }
      } catch (e) {
        if (e instanceof DocumentNotFoundError) {
          refKeys.add = newRefKeys;
        }
      }
    }
    const addedMetadata = { ...data, [modelKey]: modelName };
    const { document } = await storeLifeCycle({ key, id, data: addedMetadata, options, metadata, refKeys });
    this._applyData(document);
    return this;
  }

  /**
   * Removes the document from database
   *
   * @example
   * ```javascript
   * const user = User.findById('userId')
   *
   * await user.remove();
   * ```
   */
  async remove(options = {}) {
    const data = extractDataFromModel(this);
    const metadata = this.$;
    const { keyGenerator, scopeName, collectionName, ottoman } = metadata;
    const prefix = `${scopeName}${collectionName}`;
    const refKeys = {
      add: [],
      remove: getModelRefKeys(data, prefix, ottoman),
    };
    const idValue = this._getId();
    const id = _keyGenerator!(keyGenerator, { metadata, id: idValue });
    const { result, document } = await removeLifeCycle({ id, options, metadata, refKeys, data });
    this._applyData(document);
    return result;
  }

  /**
   * Allows to load document references
   *
   *
   * @example
   * Getting context to explain populate.
   * ```javascript
   * const CardSchema = new Schema({
   *   number: String,
   *   zipCode: String,
   *   issues: [{ type: IssueSchema, ref: 'Issue' }],
   * });
   *
   * const IssueSchema = new Schema({
   *   title: String,
   *   description: String,
   * });
   *
   * const Card = model('Card', CardSchema);
   * const Issue = model('Issue', CardSchema);
   *
   * const issue = await Issue.create({ title: 'Broken card' });
   *
   * const card = await Card.create({
   *   cardNumber: '4242 4242 4242 4242',
   *   zipCode: '42424',
   *   issues: [issue.id],
   * });
   * ```
   *
   * Now we will see how the _populate methods works.
   * ```javascript
   * const card = await Card.findById(cardId);
   * console.log(card.issues); // ['issueId']
   *
   * await card.populate('issues')
   * console.log(card.issues); // [{id: 'issueId', title: 'Broken card'}]
   * ```
   */
  async _populate(fieldsName: string | string[], deep = 1) {
    let fieldsToPopulate;
    if (fieldsName && fieldsName !== '*') {
      fieldsToPopulate = extractSchemaReferencesFromGivenFields(fieldsName, this.$.schema);
    } else {
      fieldsToPopulate = extractSchemaReferencesFields(this.$.schema);
    }
    for (const fieldName in fieldsToPopulate) {
      const field = fieldsToPopulate[fieldName];
      const modelName = (field as any).refModel;
      if (modelName) {
        const ref = this[fieldName];
        const refFields = Array.isArray(ref) ? ref : [ref];
        for (let i = 0; i < refFields.length; i++) {
          const refField = refFields[i];
          if (typeof refField === 'string' && modelName) {
            const { findById } = this.$.ottoman.getModel(modelName);
            const populated = await findById(refField);
            const currentDeep = deep - 1;
            if (currentDeep > 0) {
              await populated._populate('*', currentDeep);
            }
            refFields[i] = populated;
          }
        }
        if (Array.isArray(ref)) {
          this[fieldName] = refFields;
        } else {
          this[fieldName] = refFields[0];
        }
      }
    }
    return this;
  }

  /**
   * Reverts population. Switches back document reference
   *
   * @example
   * To get in context about the Card and Issue Models [see the populate example.](/classes/document.html#populate)
   * ```javascript
   * const card = await Card.findById(cardId);
   * console.log(card.issues); // ['issueId']
   *
   * await card._populate('issues')
   * console.log(card.issues); // [{id: 'issueId', title: 'Broken card'}]
   *
   * card._depopulate('issues')
   * console.log(card.issues); // ['issueId']
   * ```
   */
  _depopulate(fieldsName: string | string[]) {
    let fieldsToPopulate;
    if (fieldsName) {
      fieldsToPopulate = extractSchemaReferencesFromGivenFields(fieldsName, this.$.schema);
    } else {
      fieldsToPopulate = extractSchemaReferencesFields(this.$.schema);
    }
    for (const fieldName in fieldsToPopulate) {
      const data = this[fieldName];
      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          const field = data[i];
          if (field && field[this.$.ID_KEY]) {
            data[i] = field[this.$.ID_KEY];
          }
        }
      } else if (typeof data === 'object') {
        if (data && data[this.$.ID_KEY]) {
          this[fieldName] = data[this.$.ID_KEY];
        }
      }
    }
    return this;
  }

  /**
   * Allows to know if a document field is populated
   *
   * @example
   * To get in context about the Card and Issue Models [see the populate example.](/classes/document.html#populate)
   * ```javascript
   * const card = await Card.findById(cardId);
   * console.log(card.issues); // ['issueId']
   * console.log(card._populated('issues')); // false
   *
   * await card._populate('issues')
   * console.log(card.issues); // [{id: 'issueId', title: 'Broken card'}]
   * console.log(card._populated('issues')); // true
   * ```
   */
  _populated(fieldName: string): boolean {
    let data = this[fieldName];
    data = Array.isArray(data) ? data : [data];
    for (const field of data) {
      if (!(field && field[this.$.ID_KEY])) {
        return false;
      }
    }
    return true;
  }

  /**
   * Allows to easily apply data from an object to current document.
   *
   * @example
   * ```javascript
   * const user = new User({name: "John Doe"});
   *
   * user._applyData({name: "Jane Doe"});
   * console.log(user) // {name: "Jane Doe"}
   * ```
   */
  _applyData(data) {
    for (const key in data) {
      this[key] = data[key];
    }
  }

  /**
   * Runs schema validations over current document
   * @example
   * ```javascript
   * const user = new User({name: "John Doe"});
   *
   * try {
   *   await user._validate()
   * } catch(errors) {
   *   console.log(errors)
   * }
   * ```
   */
  _validate() {
    return validate(this, this.$.schema);
  }

  /**
   * Returns a Javascript object with data
   */
  toObject() {
    return this.$toObject();
  }

  /**
   * Returns a Javascript object to be serialized to JSON
   */
  toJSON() {
    return this.$toObject();
  }

  /**
   * Encapsulate logic for toObject and toJson
   * @ignore
   */
  $toObject() {
    return { ...this };
  }
}
