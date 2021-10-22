import { DocumentNotFoundError, DropCollectionOptions } from 'couchbase';
import { Query, SearchConsistency } from '..';
import { BuildIndexQueryError, OttomanError } from '../exceptions/ottoman-errors';
import { createMany, find, FindOptions, ManyQueryResponse, removeMany, updateMany } from '../handler';
import { FindByIdOptions, IFindOptions } from '../handler/';
import { LogicalWhereExpr } from '../query';
import { Schema } from '../schema';
import { cast, CAST_STRATEGY, CastOptions, MutationFunctionOptions } from '../utils/cast-strategy';
import { _keyGenerator, DEFAULT_MAX_EXPIRY } from '../utils/constants';
import { nonenumerable } from '../utils/noenumarable';
import { extractSelect } from '../utils/query/extract-select';
import { indexFieldsName } from './index/helpers/index-field-names';
import { buildIndexQuery } from './index/n1ql/build-index-query';
import { buildViewRefdoc } from './index/refdoc/build-index-refdoc';
import { buildViewIndexQuery } from './index/view/build-view-index-query';
import { CreateModel } from './interfaces/create-model.interface';
import { FindOneAndUpdateOption } from './interfaces/find.interface';
import { ModelMetadata } from './interfaces/model-metadata.interface';
import { UpdateManyOptions } from './interfaces/update-many.interface';
import { IModel } from './model';
import { ModelTypes, saveOptions } from './model.types';
import { getModelMetadata, getPopulated, setModelMetadata } from './utils/model.utils';
import { IConditionExpr } from '../query';

/**
 * @ignore
 */
export const createModel = <T = any, R = any>({ name, schemaDraft, options, ottoman }: CreateModel) => {
  const schema = schemaDraft instanceof Schema ? schemaDraft : new Schema(schemaDraft);

  const { idKey: ID_KEY, modelKey, scopeName, collectionName, keyGenerator, keyGeneratorDelimiter } = options;
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
    keyGeneratorDelimiter,
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

  // @ts-ignore
  return ModelFactory as ModelTypes<T, R>;
};

export const _buildModel = (metadata: ModelMetadata) => {
  const { schema, collection, ID_KEY, modelKey, scopeName, ottoman, modelName, keyGenerator, keyGeneratorDelimiter } =
    metadata;
  return class _Model<T> extends IModel<T> {
    constructor(data, options: CastOptions = {}) {
      super(data);
      const strategy = options.strategy || CAST_STRATEGY.DEFAULT_OR_DROP;
      const strict = options.strict !== undefined ? options.strict : schema.options.strict;
      const skip = options.skip || [modelKey, ID_KEY];
      const schemaData = cast(data, schema, { strategy, strict, skip });

      this._applyData(schemaData, strategy === CAST_STRATEGY.THROW ? CAST_STRATEGY.THROW : true);

      // Adding methods to the model instance
      if (schema?.methods) {
        for (const key in schema?.methods) {
          nonenumerable(this, key);
          this[key] = schema.methods[key];
        }
      }
      // Adding queries index
      for (const key in schema?.queries) {
        const { by, of } = schema.queries[key];
        if (by && of) {
          const QueryModel = ottoman.getModel(of);
          if (!QueryModel) {
            throw new BuildIndexQueryError(`Collection '${of}' does not exist.`);
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

    static get namespace(): string {
      const { ottoman, collectionName, scopeName } = metadata;
      if (collectionName !== '_default') {
        return `\`${ottoman.bucketName}\`.\`${scopeName}\`.\`${collectionName}\``;
      }
      return ottoman.bucketName;
    }

    static query(params: IConditionExpr): Query {
      return new Query(params, this.namespace);
    }

    static find = (filter: LogicalWhereExpr = {}, options: IFindOptions = {}) => {
      return find(metadata)(filter, { ...options, ...{ noCollection: false } });
    };

    static collection = collection;

    /**
     * dropCollection drops a collection from a scope in a bucket.
     * @param collectionName
     * @param scopeName
     * @param options
     */
    static dropCollection(
      collectionName?: string,
      scopeName?: string,
      options: DropCollectionOptions = {},
    ): Promise<boolean | undefined | void> {
      const _collectionName = collectionName || metadata.collectionName;
      const _scopeName = scopeName || metadata.scopeName;
      return ottoman.dropCollection(_scopeName, _collectionName, options);
    }

    static count = async (filter: LogicalWhereExpr = {}) => {
      const response = await find(metadata)(filter, {
        select: 'RAW COUNT(*) as count',
        noCollection: true,
        consistency: SearchConsistency.LOCAL,
      });
      if (response.hasOwnProperty('rows') && response.rows.length > 0) {
        return response.rows[0];
      }
      throw new OttomanError('The query did not return any results.');
    };

    static findById = async (id: string, options: FindByIdOptions = {}): Promise<IModel | Record<string, unknown>> => {
      const { populate, populateMaxDeep: deep, select, lean, enforceRefCheck = false, ...findOptions } = options;
      if (select) {
        findOptions['project'] = extractSelect(select, { noCollection: true }, false, modelKey);
      }
      const key = _keyGenerator!(keyGenerator, { metadata, id }, keyGeneratorDelimiter);
      const { value: pojo } = await collection().get(key, findOptions);

      if (populate) {
        return getPopulated({ fieldsName: populate, deep, lean, pojo, schema, modelName, ottoman, enforceRefCheck });
      }
      if (lean) return pojo;
      const ModelFactory = ottoman.getModel(modelName);
      return new ModelFactory(pojo, { strict: false, strategy: CAST_STRATEGY.KEEP }).$wasNew();
    };

    static findOne = async (filter: LogicalWhereExpr = {}, options: FindOptions = {}) => {
      const response = await find(metadata)(filter, {
        ...options,
        limit: 1,
      });
      if (response?.rows?.length) {
        return response.rows[0];
      }
      throw new DocumentNotFoundError();
    };

    static create = async (data: Record<string, any>, options: saveOptions = {}): Promise<any> => {
      const instance = new _Model({ ...data });
      await instance.save(true, options);
      return instance;
    };

    static createMany = async (
      docs: Record<string, unknown>[] | Record<string, unknown>,
      options: saveOptions = {},
    ) => {
      const _docs = Array.isArray(docs) ? docs : [docs];
      return await createMany(metadata)(_docs, options);
    };

    static updateById = async (id: string, data, options: MutationFunctionOptions = { strict: true }) => {
      if (data[ID_KEY] && id !== data[ID_KEY]) {
        throw new Error(`data contains id field with different value to the id provided! -> ${id} != ${data[ID_KEY]}`);
      }
      const key = id || data[ID_KEY];
      const value = await _Model.findById(key, { withExpiry: !!options.maxExpiry });
      if (value[ID_KEY]) {
        const strategy = CAST_STRATEGY.THROW;
        (value as IModel)._applyData({ ...value, ...data, ...{ [modelKey]: value[modelKey] } }, options.strict);
        const instance = new _Model({ ...value }, { strategy });
        const _options: any = {};
        if (options.maxExpiry) {
          _options.maxExpiry = options.maxExpiry;
        }
        return instance.save(false, options);
      }
    };

    static replaceById = async (id: string, data, options: MutationFunctionOptions = { strict: true }) => {
      const key = id || data[ID_KEY];
      const value = await _Model.findById(key, { withExpiry: !!options.maxExpiry });
      if (value[ID_KEY]) {
        const temp = {};
        Object.keys(data).map((key) => {
          if (value.hasOwnProperty(key)) {
            temp[key] = value[key];
          }
        });
        if (options?.strict) {
          Object.keys(value).map((key) => {
            if (value.immutableHasOwnProperty(key)) {
              temp[key] = value[key];
            }
            if (!data.hasOwnProperty(key) && options.strict === CAST_STRATEGY.THROW) {
              data[key] = undefined;
            }
          });
        }

        const replace = new _Model({ ...temp }).$wasNew();
        replace._applyData(
          {
            ...data,
            ...{ [ID_KEY]: key, [modelKey]: modelName },
          },
          options?.strict,
        );
        const _options: any = { enforceRefCheck: options.enforceRefCheck };
        if (options.maxExpiry) {
          _options.maxExpiry = options.maxExpiry;
        }
        if (options.hasOwnProperty('enforceRefCheck')) {
          _options.enforceRefCheck = options.enforceRefCheck;
        }
        return replace.save(false, _options);
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
      return new ManyQueryResponse('SUCCESS', { match_number: 0, success: 0, errors: [], data: [] });
    };

    static updateMany = async (
      filter: LogicalWhereExpr = {},
      doc: Record<string, unknown>,
      options: UpdateManyOptions = { strict: true },
    ) => {
      const response = await find(metadata)(filter, options);
      if (response?.rows?.length) {
        return updateMany(metadata)(response.rows, doc, options);
      }
      if (options.upsert) {
        const ModelFactory = ottoman.getModel(modelName);
        await ModelFactory.create(doc);
      }
      return new ManyQueryResponse('SUCCESS', {
        success: options.upsert ? 1 : 0,
        match_number: 0,
        errors: [],
        data: [],
      });
    };

    static findOneAndUpdate = async (
      filter: LogicalWhereExpr = {},
      doc: Record<string, unknown>,
      options: FindOneAndUpdateOption = { strict: true },
    ) => {
      const saveOptions: any = {};
      if (options.maxExpiry) {
        saveOptions.maxExpiry = options.maxExpiry;
      }
      if (options.hasOwnProperty('enforceRefCheck')) {
        saveOptions.enforceRefCheck = options.enforceRefCheck;
      }
      try {
        const before = await _Model.findOne(filter, { ...options, consistency: 1 });
        if (before) {
          const toSave = new _Model({ ...before }).$wasNew();
          toSave._applyData({ ...doc }, options.strict);
          const after = await toSave.save(false, saveOptions);
          return options.new ? after : before;
        }
      } catch (e) {
        if (options.upsert) {
          return await _Model.create(doc, saveOptions);
        }
        throw e;
      }
    };

    static findOneAndRemove = async (filter: LogicalWhereExpr = {}) => {
      const doc = await _Model.findOne(filter, { consistency: 1 });
      if (doc) {
        await doc.remove();
        return doc;
      }
      throw new DocumentNotFoundError();
    };
  };
};
