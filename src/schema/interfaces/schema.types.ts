import { VALIDATION_STRATEGY } from '../../utils';
import { HOOKS } from '../../utils/hooks';

export type SchemaDef = Record<string, any>;
export type FieldMap = { [key: string]: IOttomanType };
export type PluginConstructor = (Schema) => void;
export type FactoryFunction = (name, options) => IOttomanType;
/**
 * Should throw all errors detected
 */
export type ValidatorFunction = (value: unknown) => void;
export type AutoFunction = () => unknown;
export type SupportType = { [key: string]: FactoryFunction };
export type CustomValidations = { [key: string]: ValidatorFunction };
export type RequiredFunction = () => boolean | RequiredOption;
export type HookHandler = (IDocument) => void;
export type Hook = {
  [key in HOOKS]?: HookHandler[] | HookHandler;
};

export interface ValidatorOption {
  regexp: RegExp;
  message: string;
}

export interface RequiredOption {
  val: boolean;
  message: string;
}

export interface CoreTypeOptions {
  required?: boolean | RequiredOption | RequiredFunction;
  default?: unknown;
  auto?: string;
  validator?: ValidatorOption | ValidatorFunction | string;
}

export interface IOttomanType {
  name: string;
  typeName: string;
  cast(value: unknown, strategy: VALIDATION_STRATEGY): unknown;
}

export interface SchemaOptions {
  validationStrategy?: VALIDATION_STRATEGY;
  preHooks?: Hook;
  postHooks?: Hook;
}
