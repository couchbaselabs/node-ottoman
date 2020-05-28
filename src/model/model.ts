import { getCollection } from '../adapter/adapter';
import { validateSchema } from '../schema/schema';

class ModelBase {
  constructor(public __data, public __collection, public __schema) {}

  save(key) {
    validateSchema(this.__data, this.__schema);
    return this.__collection.upsert(key, this.__data);
  }
}

export const createModel = (name, schema?, options?) => {
  const collection = getCollection(name);
  return class Model extends ModelBase {
    constructor(data) {
      super(data, collection, schema);
    }
    static find(params) {
      return collection.get(params);
    }
  };
};
