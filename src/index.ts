export {
  connect,
  getCollection,
  model,
  start,
  close,
  getDefaultInstance,
  getOttomanInstances,
  getModel,
  Ottoman,
} from './ottoman/ottoman';
export { Model } from './model/model';
export { Document, IDocument } from './model/document';
export { ModelOptions } from './model/interfaces/create-model.interface';
export { ModelTypes } from './model/model.types';
export { getModelMetadata } from './model/utils/model.utils';
export { ViewIndexOptions } from './model/index/view/view-index-options';
export {
  validate,
  applyDefaultValue,
  registerType,
  addValidators,
  IOttomanType,
  Schema,
  ValidationError,
  BuildSchemaError,
} from './schema';
export { FindByIdOptions, FindOptions, IManyQueryResponse, IStatusExecution } from './handler';
export { registerGlobalPlugin } from './plugins/global-plugin-handler';
export * from './utils';
export {
  ReturnResultDict,
  ResultExprDict,
  AggDict,
  selectBuilder,
  buildSelectExpr,
  buildWhereClauseExpr,
  buildIndexExpr,
  SelectClauseException,
  MultipleQueryTypesException,
  WhereClauseException,
  QueryOperatorNotFoundException,
  QueryGroupByParamsException,
  IndexParamsUsingGSIExceptions,
  IndexParamsOnExceptions,
  Query,
  LetExprType,
  SortType,
  ISelectType,
  LogicalWhereExpr,
  ComparisonWhereExpr,
  IField,
  IIndexOnParams,
  IIndexWithParams,
  IndexType,
  ISelectAggType,
  AggType,
  ComparisonEmptyOperatorType,
  ComparisonMultipleOperatorType,
  ComparisonSingleStringOperatorType,
  ComparisonSingleOperatorType,
  LogicalOperatorType,
  ResultExprType,
  ReturnResultType,
  parseStringSelectExpr,
  escapeReservedWords,
} from './query';
export { getProjectionFields } from './utils/query/extract-select';
export { SearchConsistency } from './utils/search-consistency';
export * from './exceptions/exceptions';
export { CertificateAuthenticator } from 'couchbase';
