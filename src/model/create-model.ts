import { Model } from './model';
import { nonenumerable } from '../utils/noenumarable';
import {
  KEY_GENERATOR,
  COLLECTION_KEY,
  DEFAULT_ID_KEY,
  DEFAULT_SCOPE,
  SCOPE_KEY,
  DEFAULT_MAX_EXPIRY,
} from '../utils/constants';
import { extractSelect } from '../utils/query/extract-select';
import { find } from '../handler/find/find';
import { CreateModel } from './interfaces/create-model.interface';
import { ModelMetadata } from './interfaces/model-metadata.interface';
import { FindByIdOptions, IFindOptions } from '../handler/';
import { registerIndex, registerRefdocIndex, registerViewIndex } from './index/index-manager';
import { setModelMetadata } from './utils/model.utils';
import { buildViewIndexQuery } from './index/view/build-view-index-query';
import { buildIndexQuery } from './index/n1ql/build-index-query';
import { indexFieldsName } from './index/helpers/index-field-names';
import { buildViewRefdoc } from './index/refdoc/build-index-refdoc';
import { LogicalWhereExpr, SortType } from '../query';
import { applyDefaultValue, Schema } from '../schema';
import { ModelTypes } from './model.types';
import { SearchConsistency } from '..';

/**
 * @ignore
 */
export const createModel = ({ name, schemaDraft, options, connection }: CreateModel) => {
  const schema = schemaDraft instanceof Schema ? schemaDraft : new Schema(schemaDraft);

  const ID_KEY = options && options.idKey ? options.idKey : DEFAULT_ID_KEY;
  const keyGenerator = options && options.keyGenerator ? options.keyGenerator : KEY_GENERATOR;
  const scopeName = options && options.scopeName ? options.scopeName : DEFAULT_SCOPE;
  const collectionName = options && options.collectionName ? options.collectionName : name;
  const scopeKey = options && options.scopeKey ? options.scopeKey : SCOPE_KEY;
  const collectionKey = options && options.collectionKey ? options.collectionKey : COLLECTION_KEY;
  const collection = connection.getCollection(collectionName, scopeName);
  const maxExpiry = options && options.maxExpiry ? options.maxExpiry : DEFAULT_MAX_EXPIRY;

  const metadata: ModelMetadata = {
    modelName: name,
    collectionName,
    scopeName,
    collection,
    schema,
    ID_KEY,
    connection,
    scopeKey,
    collectionKey,
    keyGenerator,
    maxExpiry,
  };

  const ModelFactory = _buildModel(metadata);

  setModelMetadata(ModelFactory, metadata);

  // Adding dynamic static methods
  for (const key in schema?.statics) {
    ModelFactory[key] = schema?.statics[key].bind(ModelFactory);
  }

  // Adding indexes
  for (const key in schema?.index) {
    if (schema.index.hasOwnProperty(key)) {
      const { by, options, type } = schema.index[key];
      const fields = Array.isArray(by) ? by : [by];
      let indexName = `${connection.bucketName}_${scopeName}_${collectionName}$${indexFieldsName(fields)}`;
      indexName = indexName.replace(/-/g, '_');
      switch (type) {
        case 'n1ql':
          // Register access method e.g FindByName
          ModelFactory[key] = buildIndexQuery(ModelFactory, fields, key, options);
          // Register index to sync later with the server
          registerIndex(indexName, fields, collectionName);
          break;
        case 'view':
        case undefined:
          indexName = key;
          const ddocName = `${scopeName}${collectionName}`;
          ModelFactory[key] = buildViewIndexQuery(connection, ddocName, indexName, fields, ModelFactory);
          registerViewIndex(ddocName, indexName, fields, metadata);
          break;
        case 'refdoc':
          const prefix = `${scopeName}${collectionName}`;
          ModelFactory[key] = buildViewRefdoc(metadata, ModelFactory, fields, prefix);
          registerRefdocIndex(fields, prefix);
          break;
        default:
          throw new Error(`Unexpected index type in index ${key}`);
      }
    }
  }

  return ModelFactory as ModelTypes;
};

export const _buildModel = (metadata: ModelMetadata) => {
  const {
    schema,
    collection,
    ID_KEY,
    collectionName,
    collectionKey,
    scopeKey,
    scopeName,
    connection,
    modelName,
    keyGenerator,
  } = metadata;
  return class _Model<T> extends Model<T> {
    constructor(data) {
      super(data);
      this._applyData(data);
      applyDefaultValue(this, schema);

      // Adding methods to the model instance
      if (schema?.methods) {
        for (const key in schema?.methods) {
          nonenumerable(this, key);
          this[key] = schema.methods[key];
        }
      }
      // Adding queries index.
      for (const key in schema?.queries) {
        const { by, of } = schema.queries[key];
        if (by && of) {
          if (!connection.getModel(of)) {
            throw new Error(`Collection ${of} does not exist.`);
          }
          let indexName = `${connection.bucketName}_${scopeName}_${of}$${indexFieldsName([by])}`;
          indexName = indexName.replace(/-/g, '_');
          nonenumerable(this, key);
          this[key] = () => find({ ...metadata, collectionName: of })({ [by]: this._getId() });
          // Register index to sync later with the server
          registerIndex(indexName, [by], of);
        } else {
          throw new Error('The "by" and "of" properties are required to build the queries.');
        }
      }
    }

    static find = (filter: LogicalWhereExpr = {}, options: IFindOptions = {}) => {
      return find(metadata)(filter, { ...options, ...{ noCollection: false } });
    };

    static collection = collection;

    static count = async (
      filter: LogicalWhereExpr = {},
      options: { sort?: Record<string, SortType>; limit?: number; skip?: number } = {},
    ) => {
      const response = await find(metadata)(filter, {
        ...options,
        select: 'RAW COUNT(*) as count',
        noCollection: true,
        consistency: SearchConsistency.LOCAL,
      });
      if (response.hasOwnProperty('rows') && response.rows.length > 0) {
        return response.rows[0];
      }
      throw new Error('The query did not return any results.');
    };

    static findById = async (id: string, options: FindByIdOptions = {}) => {
      const findOptions = options;
      const populate = options.populate;
      delete options.populate;
      if (findOptions.select) {
        findOptions['project'] = extractSelect(findOptions.select, { noCollection: true });
        delete findOptions.select;
      }
      const key = keyGenerator!({ metadata, id });
      const { value } = await collection.get(key, findOptions);
      const ModelFactory = connection.getModel(modelName);
      const document = new ModelFactory({ ...value });
      if (populate) {
        return await document._populate(populate);
      }
      return document;
    };

    static findOne = async (filter: LogicalWhereExpr = {}, options: { sort?: Record<string, SortType> } = {}) => {
      const response = await find(metadata)(filter, {
        ...options,
        limit: 1,
        select: `\`${connection.bucketName}\`.*`,
      });
      if (response.hasOwnProperty('rows') && response.rows.length > 0) {
        return new _Model(response.rows[0]);
      }
      return null;
    };

    static create = async (data: Record<string, any>): Promise<any> => {
      const instance = new _Model({ ...data });
      await instance.save();
      return instance;
    };

    static update = async (data, id?: string) => {
      const key = id || data[ID_KEY];
      const value = await _Model.findById(key);
      const updated = {
        ...value,
        ...data,
        ...{ [collectionKey]: value[collectionKey], [scopeKey]: value[scopeKey] },
      };
      const instance = new _Model({ ...updated });
      return instance.save();
    };

    static replace = (data, id?: string) => {
      const key = id || data[ID_KEY];
      const instance = new _Model({
        ...data,
        ...{ [ID_KEY]: key, [collectionKey]: collectionName, [scopeKey]: scopeName },
      });
      return instance.save();
    };

    static removeById = (id: string) => {
      const instance = new _Model({ ...{ [ID_KEY]: id, [collectionKey]: collectionName, [scopeKey]: scopeName } });
      return instance.remove();
    };

    static fromData(data: Record<string, any>): _Model<any> {
      return new _Model(data);
    }
  };
};
