import { extractDataFromModel } from '../utils/extract-data-from-model';
import { generateUUID } from '../utils/generate-uuid';
import { COLLECTION_KEY } from '../utils/constants';
import { castSchema } from '../schema/helpers';
import { ModelMetadata } from './interfaces/model-metadata';
import { getModelMetadata } from './utils/model.utils';
import { storeLifeCycle } from './utils/store-life-cycle';
import { removeLifeCicle } from './utils/remove-life-cycle';

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
    if (!id) {
      id = generateUUID();
    } else {
      const { cas } = await this.$.collection.get(id);
      if (cas) {
        options.cas = cas;
      }
    }
    const addedMetadata = { ...data, [COLLECTION_KEY]: this.$.collectionName };
    return storeLifeCycle({ key: id, data: addedMetadata, options, model: this.$ });
  }

  /**
   * Remove document from BD
   */
  remove(options = {}) {
    return removeLifeCicle({ id: this._getId(), options, model: this.$ });
  }

  /**
   * Allow to load document references
   */
  async _populate(fieldName) {
    // const field = this.$.schema.getField(fieldName);
    const ref = this[fieldName];
    if (typeof ref === 'string') {
      const collectionName = this.$.collectionName;
      const { findById } = this.$.connection.getModel(collectionName);
      const document = await findById(ref);
      this[fieldName] = document;
      const populateMetadataKey = `$__${fieldName}`;
      Object.defineProperty(this, populateMetadataKey, {
        enumerable: false,
        value: {
          ref,
          document,
        },
      });
    }
  }

  /**
   * Revert population
   * Switch back document reference
   */
  _depopulate(fieldName) {
    const populateMetadataKey = `$__${fieldName}`;
    const data = this[populateMetadataKey];
    if (data && data.ref) {
      this[fieldName] = data.ref;
      delete this[`$__${fieldName}`];
    }
    return this;
  }

  /**
   * Allow to know if a document field is populated
   */
  _populated(fieldName: string): boolean {
    const data = this[`_${fieldName}`];
    return !!(data && data.document);
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
