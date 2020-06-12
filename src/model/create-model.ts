import { Model } from './model';
import { nonenumerable } from '../utils/noenumarable';
import { COLLECTION_KEY, DEFAULT_ID_KEY, DEFAULT_SCOPE } from '../utils/constants';
import { createSchema } from '../schema/helpers';
import { extractSelect } from '../utils/query/extract-select';
import { find } from '../handler/find/find';
import { indexFieldsName } from './index/index-field-names';
import { CreateModel } from './interfaces/create-model.interface';
import { ModelMetadata } from './interfaces/model-metadata';
import { FindByIdOptions } from '../handler/find/find-by-id-options';
import { buildIndexQuery } from './index/build-index-query';
import { registerIndex } from './index/index-manager';
import { setModelMetadata } from './utils/model.utils';
import { removeLifeCicle } from './utils/remove-life-cycle';

/**
 * @ignore
 */
export const createModel = ({ name, schemaDraft, options, connection }: CreateModel) => {
  const schema = createSchema(schemaDraft);

  const ID_KEY = options && options.id ? options.id : DEFAULT_ID_KEY;
  const scope = options && options.scope ? options.scope : DEFAULT_SCOPE;
  const collection = connection.getCollection(name, scope);

  const metadata: ModelMetadata = {
    modelName: name,
    collectionName: name,
    scopeName: scope,
    collection,
    schema,
    ID_KEY,
    connection,
  };

  const ModelFactory = _buildModel(metadata);

  setModelMetadata(ModelFactory, metadata);

  // Adding dynamic statics methods
  for (const key in schema?.statics) {
    ModelFactory[key] = schema?.statics[key];
  }

  // Adding indexes
  for (const key in schema?.index) {
    if (schema.index.hasOwnProperty(key)) {
      const { by, options } = schema.index[key];
      const fields = Array.isArray(by) ? by : [by];
      let indexName = `${connection.bucketName}_${scope}_${name}${indexFieldsName(fields)}`;
      indexName = indexName.replace(/-/g, '_');
      // Register access method e.g FindByName
      ModelFactory[key] = buildIndexQuery(ModelFactory, fields, key, options);
      // Register index to later sync with DB server
      registerIndex(indexName, fields, name);
    }
  }

  // Extend model properties dynamically to allow autocomplete and typescript support
  type ExtractStaticTypes = typeof ModelFactory;

  // Find a way to add dynamic props and methods, then remove this type
  type WhateverTypes = { [key: string]: any };

  return ModelFactory as ExtractStaticTypes &
    WhateverTypes & {
      new <T>(data: T): Model<T> & T;
    };
};

export const _buildModel = (metadata: ModelMetadata) => {
  const { schema, collection, ID_KEY, collectionName } = metadata;
  return class _Model<T> extends Model<T> {
    constructor(data) {
      super(data);
      this._applyData(data);

      // Adding methods to the model instance
      if (schema?.methods) {
        for (const key in schema?.methods) {
          nonenumerable(this, key);
          this[key] = schema.methods[key];
        }
      }
    }

    static find = find(metadata);

    static findById = async (key: string, options: FindByIdOptions = {}) => {
      const findOptions = options;
      if (findOptions.select) {
        findOptions['project'] = extractSelect(findOptions.select, { noId: true, noCollection: true });
        delete findOptions.select;
      }
      const { value } = await collection.get(key, findOptions);
      return new _Model({ ...value, [ID_KEY]: key });
    };

    static create = (data: Record<string, any>): Promise<any> => {
      const instance = new _Model({ ...data });
      return instance.save();
    };

    static update = async (data, id?: string) => {
      const key = id || data[ID_KEY];
      const { value } = await collection.get(key);
      const updated = { ...value, ...data, ...{ [ID_KEY]: key, [COLLECTION_KEY]: value[COLLECTION_KEY] } };
      const instance = new _Model({ ...updated });
      return instance.save();
    };

    static replace = (data, id?) => {
      const key = id || data[ID_KEY];
      const instance = new _Model({ ...data, ...{ [ID_KEY]: key, [COLLECTION_KEY]: collectionName } });
      return instance.save();
    };

    static remove = (id: string, options = {}) => {
      return removeLifeCicle({ id, options, model: { schema, collection } });
    };

    static fromData(data: Record<string, any>): _Model<any> {
      return new _Model(data);
    }
  };
};
