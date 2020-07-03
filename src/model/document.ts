import { extractDataFromModel } from '../utils/extract-data-from-model';
import { generateUUID } from '../utils/generate-uuid';
import { DEFAULT_POPULATE_MAX_DEEP } from '../utils/constants';
import { castSchema } from '../schema/helpers';
import { ModelMetadata } from './interfaces/model-metadata.interface';
import { getModelMetadata } from './utils/model.utils';
import { storeLifeCycle } from './utils/store-life-cycle';
import { removeLifeCycle } from './utils/remove-life-cycle';
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
   * Returns id value
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
   */
  async save() {
    const { scopeName, scopeKey, collectionName, collectionKey, collection, ID_KEY } = this.$;
    const data = extractDataFromModel(this);
    const options: any = {};
    let id = this._getId();
    const prefix = `${scopeName}${collectionName}`;
    const newRefKeys = getModelRefKeys(data, prefix);
    const refKeys: { add: string[]; remove: string[] } = {
      add: [],
      remove: [],
    };
    if (!id) {
      id = generateUUID();
      refKeys.add = newRefKeys;
    } else {
      const { cas, value: oldData } = await collection.get(id);
      const oldRefKeys = getModelRefKeys(oldData, prefix);
      refKeys.add = arrayDiff(newRefKeys, oldRefKeys);
      refKeys.remove = arrayDiff(oldRefKeys, newRefKeys);
      if (cas) {
        options.cas = cas;
      }
    }
    const addedMetadata = { ...data, [collectionKey]: collectionName, [scopeKey]: scopeName };
    const metadata = this.$;
    const { result, document } = await storeLifeCycle({ key: id, data: addedMetadata, options, metadata, refKeys });
    if (!document[ID_KEY]) {
      document[ID_KEY] = id;
    }
    this._applyData(document);
    return result;
  }

  /**
   * Removes the document from database
   */
  async remove(options = {}) {
    const data = extractDataFromModel(this);
    const prefix = `${this.$.scopeName}${this.$.collectionName}`;
    const metadata = this.$;
    const refKeys = {
      add: [],
      remove: getModelRefKeys(data, prefix),
    };
    const id = this._getId();
    const { result, document } = await removeLifeCycle({ id, options, metadata, refKeys, data });
    this._applyData(document);
    return result;
  }

  /**
   * Allows to load document references
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
   * Reverts population. Switches back document reference
   */
  _depopulate(fieldsName) {
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
   */
  _applyData(data) {
    for (const key in data) {
      this[key] = data[key];
    }
  }

  /**
   * Runs schema validations over current document
   */
  _validate() {
    return castSchema(this, this.$.schema);
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
