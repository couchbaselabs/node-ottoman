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
export { IModel } from './model/model';
export { Document, IDocument } from './model/document';
export { ModelOptions, CreateModelOptions } from './model/interfaces/create-model.interface';
export { FindOneAndUpdateOption } from './model/interfaces/find.interface';
export { ModelTypes, saveOptions } from './model/model.types';
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
  EmbedType,
  StringType,
  ArrayType,
  BooleanType,
  NumberType,
  DateType,
  CoreType,
  ReferenceType,
  MixedType,
  ValidatorOption,
} from './schema';
export { FindByIdOptions, FindOptions, IManyQueryResponse, ManyQueryResponse, IStatusExecution } from './handler';
export { registerGlobalPlugin } from './plugins/global-plugin-handler';
export * from './utils';
export * from './couchbase';
export { getProjectionFields } from './utils/query/extract-select';
export { SearchConsistency } from './utils/search-consistency';
export * from './exceptions/exceptions';
export { MutationFunctionOptions } from './utils/cast-strategy';
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
  IConditionExpr,
} from './query';
