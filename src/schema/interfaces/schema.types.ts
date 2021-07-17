import { HOOKS } from '../../utils/hooks';
import { CoreType } from '../types';
import { CAST_STRATEGY } from '../../utils/cast-strategy';

export type SchemaDef = Record<string, any>;
export type FieldMap = { [key: string]: IOttomanType };
export type PluginConstructor = (Schema) => void;
export type FactoryFunction = (name, options) => IOttomanType;
/**
 * Should throw all errors detected.
 */
export type OttomanSchemaTypes = 'String' | 'Boolean' | 'Number' | 'Date' | 'Array' | 'Reference' | 'Embed' | 'Mixed';
export type ValidatorFunction = (value: unknown) => void;
export type AutoFunction = () => unknown;
export type SupportFactoryTypes = { [key in OttomanSchemaTypes]: FactoryFunction };
export type SupportTypes = { [key in OttomanSchemaTypes]: CoreType };
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
  /**
   * If truthy, Ottoman will disallow changes to this path once the document is saved to the database for the first time.
   **/
  immutable?: boolean;
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
