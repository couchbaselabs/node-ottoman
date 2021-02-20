import couchbase from 'couchbase';
import { CountOptions, Model } from './model';
import { nonenumerable } from '../utils/noenumarable';
import { _keyGenerator, DEFAULT_MAX_EXPIRY } from '../utils/constants';
import { extractSelect } from '../utils/query/extract-select';
import { find, FindOptions, ManyQueryResponse, removeMany, updateMany } from '../handler';
import { CreateModel } from './interfaces/create-model.interface';
import { ModelMetadata } from './interfaces/model-metadata.interface';
import { FindByIdOptions, IFindOptions } from '../handler/';
import { getModelMetadata, setModelMetadata } from './utils/model.utils';
import { buildViewIndexQuery } from './index/view/build-view-index-query';
import { buildIndexQuery } from './index/n1ql/build-index-query';
import { indexFieldsName } from './index/helpers/index-field-names';
import { buildViewRefdoc } from './index/refdoc/build-index-refdoc';
import { LogicalWhereExpr } from '../query';
import { Schema } from '../schema';
import { ModelTypes } from './model.types';
import { SearchConsistency } from '..';
import { UpdateManyOptions } from './interfaces/update-many.interface';
import { FindOneAndUpdateOption } from './interfaces/find.interface';
import { cast, CAST_STRATEGY } from '../utils/cast-strategy';
import { createMany } from '../handler';
import { BuildIndexQueryError, OttomanError } from '../exceptions/ottoman-errors';

/**
 * @ignore
 */
export const createModel = ({ name, schemaDraft, options, ottoman }: CreateModel) => {
  const schema = schemaDraft instanceof Schema ? schemaDraft : new Schema(schemaDraft);

  const { idKey: ID_KEY, modelKey, scopeName, collectionName, keyGenerator } = options;
  const collection = () => ottoman.getCollection(collectionName, scopeName);
  const maxExpiry = options && options.maxExpiry ? options.maxExpiry : DEFAULT_MAX_EXPIRY;

  const metadata: ModelMetadata = {
    modelName: name,
    collectionName,
    scopeName,
    collection,
    schema,
    ID_KEY,
    ottoman,
    modelKey,
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
      let indexName = `${ottoman.bucketName}_${scopeName}_${collectionName}$${indexFieldsName(fields)}`;
      indexName = indexName.replace(/-/g, '_');
      switch (type) {
        case 'n1ql':
        case undefined:
          // Register access method e.g FindByName
          ModelFactory[key] = buildIndexQuery(ModelFactory, fields, key, options);
          // Register index to sync later with the server
          ottoman.registerIndex(indexName, fields, name);
          break;
        case 'view':
          indexName = key;
          const designDocName = `${scopeName}${collectionName}`;
          ModelFactory[key] = buildViewIndexQuery(ottoman, designDocName, indexName, fields, ModelFactory);
          ottoman.registerViewIndex(designDocName, indexName, fields, metadata);
          break;
        case 'refdoc':
          const prefix = `${scopeName}${collectionName}`;
          ModelFactory[key] = buildViewRefdoc(metadata, ModelFactory, fields, prefix);
          ottoman.registerRefdocIndex(fields, prefix);
          break;
        default:
          throw new BuildIndexQueryError(
            `Unexpected index type '${type}' in index '${key}', was expected 'refdoc', 'n1ql' or 'view'`,
          );
      }
    }
  }

  return ModelFactory as ModelTypes;
};

export const _buildModel = (metadata: ModelMetadata) => {
  const { schema, collection, ID_KEY, modelKey, scopeName, ottoman, modelName, keyGenerator } = metadata;
  return class _Model<T> extends Model<T> {
    constructor(data, options: { strategy?: CAST_STRATEGY; strict?: boolean; skip?: string[] } = {}) {
      super(data);
      const strategy = options.strategy || CAST_STRATEGY.DEFAULT_OR_DROP;
      const strict = options.strict !== undefined ? options.strict : schema.options.strict;
      const skip = options.skip || [modelKey, ID_KEY];
      const schemaData = cast(data, schema, { strategy, strict, skip });
      this._applyData(schemaData, strategy);

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
          const QueryModel = ottoman.getModel(of);
          if (!QueryModel) {
            throw new BuildIndexQueryError(`Collection ${of} does not exist.`);
          }
          const queryMetadata = getModelMetadata(QueryModel);
          let indexName = `${ottoman.bucketName}_${scopeName}_${of}$${indexFieldsName([by])}`;
          indexName = indexName.replace(/-/g, '_');
          nonenumerable(this, key);
          this[key] = () =>
            find({ ...metadata, modelName: of, collectionName: queryMetadata.collectionName })({ [by]: this._getId() });
          // Register index to sync later with the server
          ottoman.registerIndex(indexName, [by], of);
        } else {
          throw new BuildIndexQueryError('The "by" and "of" properties are required to build the queries.');
        }
      }
    }

    static find = (filter: LogicalWhereExpr = {}, options: IFindOptions = {}) => {
      return find(metadata)(filter, { ...options, ...{ noCollection: false } });
    };

    static collection = collection;

    static count = async (filter: LogicalWhereExpr = {}, options: CountOptions = {}) => {
      const response = await find(metadata)(filter, {
        ...options,
        select: 'RAW COUNT(*) as count',
        noCollection: true,
        consistency: SearchConsistency.LOCAL,
      });
      if (response.hasOwnProperty('rows') && response.rows.length > 0) {
        return response.rows[0];
      }
      throw new OttomanError('The query did not return any results.');
    };

    static findById = async (id: string, options: FindByIdOptions = {}) => {
      const findOptions = options;
      const populate = options.populate;
      delete options.populate;
      if (findOptions.select) {
        findOptions['project'] = extractSelect(findOptions.select, { noCollection: true }, false, modelKey);
        delete findOptions.select;
      }
      const key = _keyGenerator!(keyGenerator, { metadata, id });
      const { value } = await collection().get(key, findOptions);
      if (options.lean) {
        return value;
      }
      const ModelFactory = ottoman.getModel(modelName);
      const document = new ModelFactory({ ...value }, { strict: false, strategy: CAST_STRATEGY.KEEP });
      if (populate) {
        return await document._populate(populate);
      }
      return document;
    };

    static findOne = async (filter: LogicalWhereExpr = {}, options: FindOptions = {}) => {
      const response = await find(metadata)(filter, {
        ...options,
        limit: 1,
      });
      if (response.hasOwnProperty('rows') && response.rows.length > 0) {
        return response.rows[0];
      }
      return null;
    };

    static create = async (data: Record<string, any>): Promise<any> => {
      const instance = new _Model({ ...data });
      await instance.save(true);
      return instance;
    };

    static createMany = async (docs: Record<string, unknown>[] | Record<string, unknown>) => {
      const _docs = Array.isArray(docs) ? docs : [docs];
      return await createMany(metadata)(_docs);
    };

    static updateById = async (id: string, data) => {
      const key = id || data[ID_KEY];
      const value = await _Model.findById(key);
      if (value[ID_KEY]) {
        const strategy = CAST_STRATEGY.THROW;
        value._applyData({ ...value, ...data, ...{ [modelKey]: value[modelKey] } }, strategy);
        const instance = new _Model({ ...value }, { strategy });
        return instance.save();
      }
    };

    static replaceById = async (id: string, data) => {
      const key = id || data[ID_KEY];
      const value = await _Model.findById(key);
      if (value[ID_KEY]) {
        value._applyData({
          ...data,
          ...{ [ID_KEY]: key, [modelKey]: modelName },
        });
        const instance = new _Model({ ...value });
        return instance.save();
      }
    };

    static removeById = (id: string) => {
      const instance = new _Model({ ...{ [ID_KEY]: id, [modelKey]: modelName } });
      return instance.remove();
    };

    static fromData(data: Record<string, any>): _Model<any> {
      return new _Model(data);
    }

    static removeMany = async (filter: LogicalWhereExpr = {}, options: FindOptions = {}) => {
      const response = await find(metadata)(filter, options);
      if (response.hasOwnProperty('rows') && response.rows.length > 0) {
        return removeMany(metadata)(response.rows.map((v) => v[ID_KEY]));
      }
      return new ManyQueryResponse('SUCCESS', { match_number: 0, success: 0, errors: [] });
    };

    static updateMany = async (
      filter: LogicalWhereExpr = {},
      doc: Record<string, unknown>,
      options: UpdateManyOptions = {},
    ) => {
      const response = await find(metadata)(filter, options);
      if (response.hasOwnProperty('rows') && response.rows.length > 0) {
        return updateMany(metadata)(response.rows, doc);
      }
      if (options.upsert) {
        const ModelFactory = ottoman.getModel(modelName);
        await ModelFactory.create(doc);
      }
      return new ManyQueryResponse('SUCCESS', { success: options.upsert ? 1 : 0, match_number: 0, errors: [] });
    };

    static findOneAndUpdate = async (
      filter: LogicalWhereExpr = {},
      doc: Record<string, unknown>,
      options: FindOneAndUpdateOption = {},
    ) => {
      const before = await _Model.findOne(filter, options);
      if (before) {
        const afterToUpdate = _Model.fromData({ ...before });
        afterToUpdate._applyData({ ...doc });
        const after = await afterToUpdate.save();
        return options.new ? after : before;
      }
      if (options.upsert) {
        return await _Model.create(doc);
      }
      throw new (couchbase as any).DocumentNotFoundError();
    };
  };
};
