import { getCollection, validateSchema } from '..';
import { save } from '../handler/save';
import { find } from '../handler/find';
import { generateUUID } from '../utils/generate-uuid';

export class Model {
  __schema;
  __collection;
  data;

  constructor(data: any) {
    this.data = data;
  }

  save() {
    validateSchema(this.data, this.__schema);
    return save(generateUUID(), this.data, this.__collection);
  }

  static find = (params): Promise<any> => Promise.resolve();
  static create = (data: any): Promise<any> => Promise.resolve();
}

export const model = (name, schema?, connection?, options?) => {
  const collection = getCollection(name);
  return class ModelFactory extends Model {
    constructor(data) {
      super(data);
      this.__collection = collection;
      this.__schema = schema;
    }

    static find = (params): Promise<any> => {
      return find(params, collection);
    };

    static create = (data: Record<string, any>): Promise<any> => save(generateUUID(), data, collection);

    static insertMany(data: Record<string, any>[]): Promise<any> {
      return Promise.all(data.map((d) => this.create(d)));
    }
  };
};
