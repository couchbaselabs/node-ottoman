import { getCollection, validateSchema } from '..';
import { save } from '../handler/save';
import { find } from '../handler/find';

export class Model {
  __schema;
  __collection;
  data;

  constructor(data: any) {
    this.data = data;
  }

  save(key) {
    validateSchema(this.data, this.__schema);
    return save(key, this.data, this.__collection);
  }

  static find = (params): Promise<any> => Promise.resolve();
  static create = (key: string, data: any): Promise<any> => Promise.resolve();
}

export const model = (name, schema?, connection?, options?) => {
  const collection = getCollection(name);
  return class ModelFactory extends Model {
    constructor(data) {
      super(data);
      this.__collection = collection;
      this.__schema = schema;
    }

    static find = (params) => {
      return find(params, collection)
    };
    static create = (key, data) => save(key, data, collection);
  };
};
