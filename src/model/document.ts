import { DocumentExistsError, DocumentNotFoundError } from '../exceptions/exceptions';
import { ImmutableError } from '../exceptions/ottoman-errors';
import { validate } from '../schema';
import { ApplyStrategy, CAST_STRATEGY, CastOptions } from '../utils/cast-strategy';
import { _keyGenerator } from '../utils/constants';
import { extractDataFromModel } from '../utils/extract-data-from-model';
import { generateUUID } from '../utils/generate-uuid';
import { isPopulateAnObject } from '../utils/populate/is-populate-object';
import {
  extractPopulateFieldsFromObject,
  extractSchemaReferencesFields,
  extractSchemaReferencesFromGivenFields,
} from '../utils/schema.utils';
import { ModelMetadata } from './interfaces/model-metadata.interface';
import { PopulateFieldsType } from './populate.types';
import { arrayDiff } from './utils/array-diff';
import { getModelRefKeys } from './utils/get-model-ref-keys';
import { getModelMetadata } from './utils/model.utils';
import { removeLifeCycle } from './utils/remove-life-cycle';
import { storeLifeCycle } from './utils/store-life-cycle';

/**
 * Document class represents a database document and provides useful methods to work with.
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
 * const jane = new User({ name: "Jane Doe" })
 * ```
 */
export abstract class Document<T = any> {
  /**
   * @ignore
   */
  [key: string]: any;

  /**
   * @ignore
   */
  // eslint-disable-next-line no-unused-vars
  protected constructor(data, options: CastOptions = {}) {
    const { get, set, getStrategy, setStrategy, hasOwnProperty } = (function immutables() {
      const i = {};
      let strategy: ApplyStrategy | undefined;
      return {
        get(key: string) {
          return i[key];
        },
        set(key: string, value: any) {
          i[key] = value;
        },
        hasOwnProperty(key: string): boolean {
          return i.hasOwnProperty(key);
        },
        getStrategy() {
          return strategy;
        },
        setStrategy(value?: ApplyStrategy) {
          strategy = value;
        },
      };
    })();
    Object.defineProperties(this, {
      setImmutable: {
        value: function (key: string, value: any): void {
          set(key, value);
        },
      },
      getImmutable: {
        value: function (key: string): any {
          return get(key);
        },
      },
      immutableHasOwnProperty: {
        value: function (key: string): boolean {
          return hasOwnProperty(key);
        },
      },
      getCurrentStrategy: {
        value: function () {
          return getStrategy();
        },
      },
      setCurrentStrategy: {
        value: function (value?: ApplyStrategy) {
          setStrategy(value);
        },
      },
    });
  }

  /**
   * @ignore
   */
  get $(): ModelMetadata {
    return getModelMetadata(this.constructor);
  }
  /**
   * Returns id value, useful when working with dynamic ID_KEY.
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
   * Returns id key.
   */
  _getIdField(): string {
    return this.$.ID_KEY;
  }

  /**
   * Saves or Updates the document.
   *
   * @example
   * ```javascript
   * const user = new User({ name: "John Doe" }); //user document created, it's not saved yet
   *
   * await user.save(); // user saved into the DB
   *
   * // You also can force save function to only create new Documents by passing true as argument
   * await user.save(true); // ensure to execute a insert operation
   * ```
   */
  async save(onlyCreate = false) {
    const {
      scopeName,
      collectionName,
      modelKey,
      collection,
      keyGenerator,
      modelName,
      ottoman,
      keyGeneratorDelimiter,
    } = this.$;
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
      key = _keyGenerator!(keyGenerator, { metadata, id }, keyGeneratorDelimiter);
      if (!data[this._getIdField()]) {
        data[this._getIdField()] = id;
      }
      refKeys.add = newRefKeys;
    } else {
      try {
        key = _keyGenerator!(keyGenerator, { metadata, id }, keyGeneratorDelimiter);
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
   * Removes the document from the database.
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
    const { keyGenerator, scopeName, collectionName, ottoman, keyGeneratorDelimiter } = metadata;
    const prefix = `${scopeName}${collectionName}`;
    const refKeys = {
      add: [],
      remove: getModelRefKeys(data, prefix, ottoman),
    };
    const idValue = this._getId();
    const id = _keyGenerator!(keyGenerator, { metadata, id: idValue }, keyGeneratorDelimiter);
    const { result, document } = await removeLifeCycle({ id, options, metadata, refKeys, data });
    this._applyData(document);
    return result;
  }

  /**
   * Allows to load document references.
   *
   *
   * @example
   * Getting context to explain populate.
   * ```typescript
   * // Defining the schemas
   * const addressSchema = new Schema({
   *   address: String,
   * });
   * const personSchema = new Schema({
   *   name: String,
   *   age: Number,
   *   address: { type: addressSchema, ref: 'Address' },
   * });
   * const companySchema = new Schema({
   *   president: { type: personSchema, ref: 'Person' },
   *   ceo: { type: personSchema, ref: 'Person' },
   *   name: String,
   *   workers: [{ type: personSchema, ref: 'Person' }],
   * });
   *
   * // Initializing the models
   * const Address = model('Address', addressSchema);
   * const Person = model('Person', personSchema);
   * const Company = model('Company', companySchema);
   *
   * // Adding some data
   * const johnAddress = await Address.create({ address: '13 Washington Square S, New York, NY 10012, USA' });
   * const john = await Person.create({ name: 'John Smith', age: 52, address: johnAddress });
   *
   * const janeAddress = await Address.create({ address: '55 Clark St, Brooklyn, NY 11201, USA' });
   * const jane = await Person.create({ name: 'Jane Doe', age: 45, address: janeAddress });
   *
   * const company = await Company.create({ name: 'Space X', president: john, ceo: jane });
   *
   *
   * // Getting saved company data
   * const spaceX = await Company.findById(company.id);
   * console.log(`Company: `, company);
   * ```
   *
   * Will get:
   * ```
   * Company: {
   *     name: 'Space X',
   *     president: '50e85ac9-5b4f-4587-aeb6-b287527794c9',
   *     ceo: '32c2e85a-cc91-4db2-935f-f7d2768168de',
   *     id: 'd59efbdf-4b7e-4d2f-a986-6e8451f22822',
   *     _type: 'Company'
   * }
   * ```
   *
   * Now we will see how the _populate methods works.
   * ```typescript
   * const result = await spaceX._populate('ceo');
   * console.log(`Result: `, result);
   * ```
   * ```
   * Result: {
   *   name: 'Space X',
   *   president: '50e85ac9-5b4f-4587-aeb6-b287527794c9',
   *   ceo: {
   *     name: 'Jane Doe',
   *     age: 45,
   *     address: '235dd441-b445-4b88-b6aa-2ce35a958a32',
   *     id: '32c2e85a-cc91-4db2-935f-f7d2768168de',
   *     _type: 'Person'
   *   },
   *   id: 'd59efbdf-4b7e-4d2f-a986-6e8451f22822',
   *   _type: 'Company'
   * }
   * ```
   *
   * Can also pass an array or a string separated by a comma
   * ```typescript
   * const result = await spaceX._populate('ceo,president');
   * // or
   * const result = await spaceX._populate(['ceo', 'president']);
   * console.log(`Result: `, result);
   * ```
   * ```
   * Result: {
   *   name: 'Space X',
   *   president: {
   *     name: 'John Smith',
   *     age: 52,
   *     address: 'bc7ea8a8-8d1c-4ab6-990c-d3a0163f7e10',
   *     id: '50e85ac9-5b4f-4587-aeb6-b287527794c9',
   *     _type: 'Person'
   *   },
   *   ceo: {
   *     name: 'Jane Doe',
   *     age: 45,
   *     address: '235dd441-b445-4b88-b6aa-2ce35a958a32',
   *     id: '32c2e85a-cc91-4db2-935f-f7d2768168de',
   *     _type: 'Person'
   *   },
   *   id: 'd59efbdf-4b7e-4d2f-a986-6e8451f22822',
   *   _type: 'Company'
   * }
   * ```
   *
   * If you want to get only a portion of the object
   * ```typescript
   * const result = await spaceX._populate({
   *   ceo: ['age', 'address'], // or 'age,addres'
   *   president: 'name',
   * });
   * console.log(`Result: `, result);
   * ```
   * ```
   * Result: {
   *   name: 'Space X',
   *   president: { name: 'John Smith' },
   *   ceo: { age: 45, address: '235dd441-b445-4b88-b6aa-2ce35a958a32' },
   *   id: 'd59efbdf-4b7e-4d2f-a986-6e8451f22822',
   *   _type: 'Company'
   * }
   * ```
   *
   * Now let's to go deeper
   * ```typescript
   * const result = await spaceX._populate(
   *   {
   *     ceo: {
   *       select: 'age,id', // remember you can use ['age','address']
   *       populate: 'address', // will populate all the fields
   *     },
   *     president: {
   *       select: 'name',
   *       populate: {
   *         address: 'address', // will populate address field only
   *       },
   *     },
   *   },
   *   2, // for populate up to the second level
   * );
   * console.log(`Result: `, result);
   * ```
   * ```
   * Result: {
   *   name: 'Space X',
   *   president: {
   *     name: 'John Smith',
   *     address: { address: '13 Washington Square S, New York, NY 10012, USA' }
   *   },
   *   ceo: {
   *     age: 45,
   *     id: '32c2e85a-cc91-4db2-935f-f7d2768168de',
   *     address: {
   *       address: '55 Clark St, Brooklyn, NY 11201, USA',
   *       id: '235dd441-b445-4b88-b6aa-2ce35a958a32',
   *       _type: 'Address'
   *     }
   *   },
   *   id: 'd59efbdf-4b7e-4d2f-a986-6e8451f22822',
   *   _type: 'Company'
   * }
   *```
   * Below is another way through the find functions
   * ```typescript
   * const result = await Company.findOne(
   *   { name: 'Space X' },
   *   {
   *     select: 'president,ceo',
   *     populate: {
   *       president: { select: 'address,id', populate: 'address' },
   *       ceo: { select: ['age', 'name'], populate: { address: { select: 'id' } } },
   *     },
   *     populateMaxDeep: 2,
   *   },
   * );
   * console.log(`Result: `, result);
   * ```
   * ```
   * Result: {
   *   ceo: {
   *     age: 45,
   *     name: 'Jane Doe',
   *     address: { id: '235dd441-b445-4b88-b6aa-2ce35a958a32' }
   *   },
   *   president: {
   *     address: {
   *       address: '13 Washington Square S, New York, NY 10012, USA',
   *       id: 'bc7ea8a8-8d1c-4ab6-990c-d3a0163f7e10',
   *       _type: 'Address'
   *     },
   *     id: '50e85ac9-5b4f-4587-aeb6-b287527794c9'
   *   }
   * }
   * ```
   */
  async _populate(fieldsName?: PopulateFieldsType, deep = 1) {
    let fieldsToPopulate;
    const isObject = isPopulateAnObject(fieldsName);
    if (isObject) {
      fieldsToPopulate = extractSchemaReferencesFromGivenFields(Object.keys(fieldsName ?? ''), this.$.schema);
    } else if (fieldsName && fieldsName !== '*') {
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
        const refFieldsLength = refFields.length;
        for (let i = 0; i < refFieldsLength; i++) {
          const refField = refFields[i];
          if (typeof refField === 'string' && modelName) {
            const { findById } = this.$.ottoman.getModel(modelName);

            const current = fieldsName?.[fieldName];
            const lean = (this.$ as any).lean || undefined;
            const select =
              isObject && current !== '*' && current?.select !== '*'
                ? typeof current === 'string' || Array.isArray(current)
                  ? current
                  : extractPopulateFieldsFromObject(current) ?? undefined
                : undefined;
            const populated = await findById(refField, { select });
            const currentDeep = deep - 1;
            if (currentDeep > 0) {
              populated.$.lean = lean;
              await populated._populate(current?.populate ?? current ?? '*', currentDeep);
              delete populated.$.lean;
            }
            refFields[i] = lean ? populated.toObject() : populated;
          }
        }

        this[fieldName] = Array.isArray(ref) ? refFields : refFields[0];
      }
    }
    return this;
  }

  /**
   * Reverts population. Switches back document reference.
   *
   * @example
   * To get in context about the Card and Issue Models [see the populate example.](/classes/document.html#populate).
   * ```javascript
   * const card = await Card.findById(cardId);
   * console.log(card.issues); // ['issueId']
   *
   * await card._populate('issues')
   * console.log(card.issues); // [{ id: 'issueId', title: 'Broken card' }]
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
   * Allows to know if a document field is populated.
   *
   * @example
   * To get in context about the Card and Issue Models [see the populate example.](/classes/document.html#populate).
   * ```javascript
   * const card = await Card.findById(cardId);
   * console.log(card.issues); // ['issueId']
   * console.log(card._populated('issues')); // false
   *
   * await card._populate('issues')
   * console.log(card.issues); // [{ id: 'issueId', title: 'Broken card' }]
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
   * ```typescript
   * const user = new User({ name: "John Doe" });
   *
   * user._applyData({ name: "Jane Doe" });
   * console.log(user) // { name: "Jane Doe" }
   * ```
   *
   * @example With strategies on immutable properties
   * ```typescript
   * const User = model('Card', { name: { type: String, immutable: true } });
   * const user = new User({ name: 'John Doe' });
   *
   *  // with strategy:false is like above example
   *  user._applyData({ name: 'Jane Doe' }, false);
   *  console.log(user); // { name: "Jane Doe" }
   *
   *  // with strategy:true remains immutable
   *  user._applyData({ name: 'Jane Doe' }, true);
   *  console.log(user); // { name: "John Doe" }
   *
   *  // trying to update it directly
   *  user.name = 'Jane Doe';
   *  console.log(user); // { name: "John Doe" }
   *
   *  // with strategy:CAST_STRATEGY.THROW
   *  user._applyData({ name: 'Jane Doe' }, CAST_STRATEGY.THROW);
   *  // ImmutableError: Field 'name' is immutable and current cast strategy is set to 'throw'
   * ```
   */
  _applyData(data, strategy: ApplyStrategy = true) {
    this.setCurrentStrategy(strategy);
    const strict = this.$.schema.options.strict;
    for (const key in data) {
      this[key] = data[key];
      const isImmutable = (this.$.schema.fields[key] as any)?.options?.immutable;
      if (!this.immutableHasOwnProperty(key) && isImmutable && strict) {
        this.setImmutable(key, data[key]);
        Object.defineProperty(this, key, {
          get() {
            return this.getImmutable(key);
          },
          set(value) {
            const currentStrategy = this.getCurrentStrategy();
            if (currentStrategy === CAST_STRATEGY.THROW && this.getImmutable(key) !== value) {
              throw new ImmutableError(`Field '${key}' is immutable and current cast strategy is set to 'throw'`);
            }
            if (typeof currentStrategy === 'boolean' && !currentStrategy) {
              this.setImmutable(key, value);
            }
          },
        });
      }
    }
  }

  /**
   * Runs schema validations over current document.
   * @example
   * ```javascript
   * const user = new User( { name: "John Doe" } );
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
