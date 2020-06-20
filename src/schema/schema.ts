import {
  arrayTypeFactory,
  booleanTypeFactory,
  CoreType,
  dateTypeFactory,
  embedTypeFactory,
  IOttomanType,
  numberTypeFactory,
  referenceTypeFactory,
  stringTypeFactory,
} from './types';
import { isMetadataKey } from '../utils/is-metadata';
import { BuildSchemaError, ValidationError } from './errors';
import { Model } from '..';
import { SchemaIndex } from '../model/index/types/index.types';
import { getGlobalPlugins } from '../plugins/global-plugin-handler';
import { buildFields } from './helpers';
import { HOOKS } from '../utils/hooks';

export type SchemaDef = Record<string, any>;
export type ModelObject = { [key: string]: unknown };
export type FieldMap = { [key: string]: IOttomanType };
export type PluginConstructor = (Schema) => void;
export type FactoryFunction = (name, options) => IOttomanType;
export type SupportType = { [key: string]: FactoryFunction };

export class Schema {
  static Types: SupportType = {
    String: stringTypeFactory,
    Boolean: booleanTypeFactory,
    Number: numberTypeFactory,
    Date: dateTypeFactory,
    Array: arrayTypeFactory,
    Reference: referenceTypeFactory,
    Embed: embedTypeFactory,
  };
  statics = {};
  methods = {};
  preHooks = {};
  postHooks = {};
  index: SchemaIndex = {};
  public fields: FieldMap;

  /**
   * @summary Create an instance of Schema
   * @name Schema
   * @class
   * @public
   *
   * @param obj in definitions of Schema
   * @returns Schema
   *
   * @example
   * ```ts
   *  const schema = new Schema([new StringType('name')]);
   * ```
   */
  constructor(obj: SchemaDef | Schema) {
    this.fields = buildFields(obj);
    this.plugin(...getGlobalPlugins());
  }
  /**
   * Cast a model instance using the definition of the schema
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const schema = new Schema([new StringType('name'), new NumberType('age')]);
   *   const result = schema.cast({name: 'John Doe', age: '34'});
   *   console.log(result)
   * ```
   * > {name: 'John Doe', age: 34}
   */
  cast(object: Model | ModelObject): Model | ModelObject {
    const errors: string[] = [];
    for (const key in this.fields) {
      const type = this.fields[key];
      if (!isMetadataKey(type.name)) {
        try {
          const value = object[type.name];
          object[type.name] = type.cast(value);
        } catch (e) {
          errors.push(e.message);
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
    return object;
  }

  /**
   * Apply default values defined on schema to an object instance
   * @method
   * @public
   * @param obj
   */
  applyDefaultsToObject(obj: ModelObject): ModelObject {
    for (const key in this.fields) {
      const field = this.fields[key];
      if (typeof obj[field.name] === 'undefined' && field instanceof CoreType) {
        obj[field.name] = field.buildDefault();
      }
    }
    return obj;
  }

  path(path: string): IOttomanType | undefined {
    return this.fields[path];
  }

  /**
   * Allow to apply plugins, to extend schema and model features.
   */
  plugin(...fns: PluginConstructor[]): Schema {
    if (fns && Array.isArray(fns)) {
      for (const fn of fns) {
        fn(this);
      }
    }
    return this;
  }

  pre(hook: HOOKS, handler): Schema {
    Schema.checkHook(hook);
    if (this.preHooks[hook] === undefined) {
      this.preHooks[hook] = [];
    }
    this.preHooks[hook].push(handler);
    return this;
  }

  post(hook: HOOKS, handler): Schema {
    Schema.checkHook(hook);
    if (this.postHooks[hook] === undefined) {
      this.postHooks[hook] = [];
    }
    this.postHooks[hook].push(handler);
    return this;
  }
  private static checkHook(hook: HOOKS): void {
    if (!Object.values(HOOKS).includes(hook)) {
      throw new BuildSchemaError(`The hook ${hook} is not allowed`);
    }
  }
}
