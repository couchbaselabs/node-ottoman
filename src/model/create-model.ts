import { find } from '../handler/find';
import { remove } from '../handler/remove';
import { Model } from './model';
import { nonenumerable } from '../utils/noenumarable';
import { COLLECTION_KEY, DEFAULT_ID_KEY } from '../utils/constants';
import { removeLifeCicle } from './remove-life-cycle';

/**
 * @ignore
 */
export const createModel = ({ name, schema, options, connection }) => {
  const ID_KEY = options && options.id ? options.id : DEFAULT_ID_KEY;
  const collection = connection.getCollection(name);
  return class __ModelFactory__ extends Model {
    constructor(data) {
      super(data);
      nonenumerable(this, '$');
      this.$ = {
        collectionName: name,
        collection: collection,
        schema: schema,
        ID_KEY,
      };
    }

    static find = (params): Promise<any> => {
      return find(params, collection);
    };

    static getById = async (key: string) => {
      const { value } = await collection.get(key);
      return new __ModelFactory__({ ...value });
    };

    static create = (data: Record<string, any>): Promise<any> => {
      const instance = new __ModelFactory__({ ...data });
      return instance.save();
    };

    static update = async (data, id?: string) => {
      const key = id || data[ID_KEY];
      const { value } = await collection.get(key);
      const updated = { ...value, ...data, ...{ [ID_KEY]: key, [COLLECTION_KEY]: value[COLLECTION_KEY] } };
      const instance = new __ModelFactory__({ ...updated });
      return instance.save();
    };

    static replace = (data, id?) => {
      const key = id || data[ID_KEY];
      const instance = new __ModelFactory__({ ...data, ...{ [ID_KEY]: key, [COLLECTION_KEY]: name } });
      return instance.save();
    };

    static remove = (id: string, options = {}) => {
      return removeLifeCicle({ id, options, model: { schema, collection } });
    };

    static insertMany(data: Record<string, any>[]): Promise<any> {
      return Promise.all(data.map((d) => this.create(d)));
    }
  };
};
