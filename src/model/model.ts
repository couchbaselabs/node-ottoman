import { generateUUID } from '../utils/generate-uuid';
import { extractDataFromModel } from '../utils/extract-data-from-model';
import { storeLifeCycle } from './store-life-cycle';
import { COLLECTION_KEY } from '../utils/constants';
import { removeLifeCicle } from './remove-life-cycle';

/**
 * Constructor to build a model instance base on schema and options
 * Provide methods to handle documents of the current collection on DB
 */
export class Model {
  /**
   * @ignore
   */
  $!: {
    collectionName: string;
    schema: any;
    collection: any;
    ID_KEY: string;
  };

  constructor(data: any) {
    for (const key in data) {
      this[key] = data[key];
    }
  }

  /**
   * return id value
   */
  getId(): string {
    return this[this.$.ID_KEY];
  }

  /**
   * Save or Update document, I
   * If the document has id (key) will be update
   * Else a new id (key) will be assigned and document will be stored
   */
  async save() {
    const data = extractDataFromModel(this);
    const options: any = {};
    const id = this.getId();
    if (!id) {
      data[this.$.ID_KEY] = generateUUID();
    } else {
      const { cas } = await this.$.collection.get(id);
      if (cas) {
        options.cas = cas;
      }
    }
    const addedMetadata = { ...data, [COLLECTION_KEY]: this.$.collectionName };
    return storeLifeCycle({ data: addedMetadata, options, model: this.$ });
  }

  /**
   * Remove document from BD
   */
  remove(options = {}) {
    return removeLifeCicle({ id: this.getId(), options, model: this.$ });
  }

  /**
   * Return javascript object with data
   */
  toCoo() {
    return extractDataFromModel(this);
  }

  /**
   * Return javascript object serialized to JSON
   */
  toJSON() {
    return JSON.stringify(this.toCoo());
  }

  /**
   * Find documents base on filter on the collection
   */
  static find = (params): Promise<any> => Promise.resolve(params);

  /**
   * Add new document to collection
   */
  static create = (data: any): Promise<any> => Promise.resolve(data);

  /**
   * Update document in the collection
   * Can update document partial or complete
   * id parameter will have more priority that data.id
   */
  static update = (data: any, id?: string): Promise<any> => Promise.resolve({ data, id });

  /**
   * Replace document in the collection
   * Will replace the entire document with the given data
   * id parameter will have more priority that data.id
   */
  static replace = (data: any, id?: string): Promise<any> => Promise.resolve({ data, id });

  /**
   * Remove document in the collection with the provide id
   */
  static remove = (id: string): Promise<any> => Promise.resolve(id);
}
