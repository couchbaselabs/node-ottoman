import { HOOKS } from '../../utils/hooks';
import { CAST_STRATEGY } from '../../utils/cast-strategy';

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
  validator?: ValidatorOption | ValidatorFunction | string;
}

export abstract class IOttomanType {
  protected constructor(public name: string, public typeName: string) {}
  abstract cast(value: unknown, strategy?: CAST_STRATEGY): unknown;
  abstract validate(value: unknown, strict?: boolean): unknown;
}

export interface SchemaOptions {
  strict?: boolean;
  preHooks?: Hook;
  postHooks?: Hook;
}
