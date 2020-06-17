import { extractDataFromModel } from '../utils/extract-data-from-model';
import { generateUUID } from '../utils/generate-uuid';
import { COLLECTION_KEY, DEFAULT_POPULATE_MAX_DEEP, SCOPE_KEY } from '../utils/constants';
import { castSchema } from '../schema/helpers';
import { ModelMetadata } from './interfaces/model-metadata';
import { getModelMetadata } from './utils/model.utils';
import { storeLifeCycle } from './utils/store-life-cycle';
import { removeLifeCicle } from './utils/remove-life-cycle';
import { arrayDiff } from './utils/array-diff';
import { getModelRefKeys } from './utils/get-model-ref-keys';
import { extractSchemaReferencesFields, extractSchemaReferencesFromGivenFields } from '../utils/schema.utils';

export abstract class Document<T> {
  /**
   * @ignore
   */
  get $(): ModelMetadata {
    return getModelMetadata(this.constructor);
  }
  /**
   * return id value
   */
  _getId(): string {
    return this[this.$.ID_KEY];
  }

  /**
   * return id key
   */
  _getIdField(): string {
    return this.$.ID_KEY;
  }

  /**
   * Save or Update documents
   */
  async save() {
    const data = extractDataFromModel(this);
    const options: any = {};
    let id = this._getId();
    const prefix = `${this.$.scopeName}${this.$.collectionName}`;
    const newRefKeys = getModelRefKeys(data, prefix);
    const refKeys: { add: string[]; remove: string[] } = {
      add: [],
      remove: [],
    };
    if (!id) {
      id = generateUUID();
      refKeys.add = newRefKeys;
    } else {
      const { cas, value: oldData } = await this.$.collection.get(id);
      const oldRefKeys = getModelRefKeys(oldData, prefix);
      refKeys.add = arrayDiff(newRefKeys, oldRefKeys);
      refKeys.remove = arrayDiff(oldRefKeys, newRefKeys);
      if (cas) {
        options.cas = cas;
      }
    }
    const addedMetadata = { ...data, [COLLECTION_KEY]: this.$.collectionName, [SCOPE_KEY]: this.$.scopeName };
    const metadata = this.$;
    return storeLifeCycle({ key: id, data: addedMetadata, options, metadata, refKeys });
  }

  /**
   * Remove document from DB
   */
  remove(options = {}) {
    const data = extractDataFromModel(this);
    const prefix = `${this.$.scopeName}${this.$.collectionName}`;
    const metadata = this.$;
    const refKeys = {
      add: [],
      remove: getModelRefKeys(data, prefix),
    };
    return removeLifeCicle({ id: this._getId(), options, metadata, refKeys });
  }

  /**
   * Allow to load document references
   */
  async _populate(fieldsName, deep = DEFAULT_POPULATE_MAX_DEEP) {
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
            const { findById } = this.$.connection.getModel(modelName);
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
   * Revert population
   * Switch back document reference
   */
  _depopulate(fieldName) {
    const data = this[fieldName];
    if (typeof data === 'string') {
      if (data && data[this.$.ID_KEY]) {
        this[fieldName] = data[this.$.ID_KEY];
      }
    } else if (Array.isArray(data)) {
      for (let field of data) {
        if (field && field[this.$.ID_KEY]) {
          field = field[this.$.ID_KEY];
        }
      }
    }

    return this;
  }

  /**
   * Allow to know if a document field is populated
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
   * Allow easy apply data from object to current document.
   */
  _applyData(data) {
    for (const key in data) {
      this[key] = data[key];
    }
  }

  /**
   * Run schema validations over current document
   */
  _validate() {
    return castSchema(this, this.$.schema);
  }

  /**
   * Return javascript object with data
   */
  toObject() {
    return this.$toObject();
  }

  /**
   * Return javascript object to be serialized to JSON
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
