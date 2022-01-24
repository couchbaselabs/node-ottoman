import { getModelMetadata, SearchConsistency } from '../..';
import { ModelMetadata } from '../../model/interfaces/model-metadata.interface';
import { getPopulated, PopulateAuxOptionsType } from '../../model/utils/model.utils';
import { LogicalWhereExpr, Query } from '../../query';
import { CAST_STRATEGY } from '../../utils/cast-strategy';
import { isDebugMode } from '../../utils/is-debug-mode';
import { getProjectionFields } from '../../utils/query/extract-select';
import { isNumber } from '../../utils/type-helpers';
import { FindOptions } from './find-options';
import { MODEL_KEY } from '../../utils/constants';

/**
 * Find documents using filter and options.
 * @ignore
 */
export const find =
  (metadata: ModelMetadata) =>
  async (filter: LogicalWhereExpr = {}, options: FindOptions = {}) => {
    const {
      skip,
      limit,
      sort,
      populate,
      select,
      noCollection,
      populateMaxDeep: deep,
      consistency,
      lean,
      ignoreCase,
      enforceRefCheck,
    } = options;
    const { ottoman, collectionName, modelKey, scopeName, modelName, ID_KEY, schema } = metadata;
    const { bucketName, cluster, couchbase } = ottoman;
    let fromClause = bucketName;
    let selectDot = bucketName;
    if (collectionName !== '_default') {
      fromClause = `\`${bucketName}\`.\`${scopeName}\`.\`${collectionName}\``;
      selectDot = collectionName;
    }
    // Handling select
    const Model = ottoman.getModel(modelName);
    let fields: any = Object.keys(getModelMetadata(Model).schema.fields);

    if (!fields.includes(ID_KEY)) {
      fields.push(ID_KEY);
    }

    if (!fields.includes(MODEL_KEY)) {
      fields.push(MODEL_KEY);
    }

    fields = fields.map((field) => `\`${field}\``);
    if (select || !schema.options.strict) {
      fields = select;
    }

    const projectionFields = getProjectionFields(
      selectDot,
      fields,
      {
        noCollection: !schema.options.strict ? noCollection : true,
      },
      modelKey,
    );

    // Handling conditions
    const expr_where = {
      ...filter,
      [modelKey as string]: modelName,
    };

    // Building the query
    let query = new Query({}, fromClause).select(projectionFields.projection).where(expr_where);

    if (isNumber(limit)) {
      query = query.limit(limit as number);
    }
    if (skip) {
      query = query.offset(skip);
    }
    if (sort) {
      query = query.orderBy(sort);
    }
    const queryOptions: Record<string, unknown> = {};
    const _consistency = consistency || ottoman.config.consistency || SearchConsistency.NONE;
    switch (_consistency) {
      case SearchConsistency.GLOBAL:
      case SearchConsistency.LOCAL:
        queryOptions.scanConsistency = couchbase.QueryScanConsistency.RequestPlus;
        break;
      case SearchConsistency.NONE:
        queryOptions.scanConsistency = couchbase.QueryScanConsistency.NotBounded;
        break;
    }

    const direct = (lean && !populate) || select === 'RAW COUNT(*) as count';
    const n1ql = query.build({ ignoreCase });
    if (isDebugMode()) {
      console.log(n1ql);
    }
    const result = await cluster.query(n1ql, queryOptions);

    if (direct) return result;

    if (populate) {
      const params = {
        deep,
        lean,
        schema,
        ottoman,
        modelName,
        fieldsName: populate,
        enforceRefCheck,
      } as PopulateAuxOptionsType;
      result.rows = await Promise.all(result.rows.map((pojo) => getPopulated({ ...params, pojo })));
    } else {
      const newModelOptions = { strict: false, strategy: CAST_STRATEGY.KEEP };
      result.rows = result.rows.map((row) => new Model(row, newModelOptions).$wasNew());
    }
    return result;
  };
