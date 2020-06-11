import {
  arrayTypeFactory,
  booleanTypeFactory,
  dateTypeFactory,
  embedTypeFactory,
  IOttomanType,
  numberTypeFactory,
  referenceTypeFactory,
  stringTypeFactory,
} from './types';
import { isMetadataKey } from '../utils/is-metadata';
import { ValidationError } from './errors';
import { Model } from '../model/model';

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
  /**
   * Name of id field
   */
  private _id: string;

  statics = {};
  methods = {};
  preHooks = {};
  postHooks = {};

  /**
   * @summary Create an instance of Schema
   * @name Schema
   * @class
   * @public
   *
   * @param fields in definitions of Schema
   * @returns Schema
   *
   * @example
   * ```ts
   *  const schema = new Schema([new StringType('name')]);
   * ```
   */
  constructor(private fields: FieldMap) {
    this._id = '_id';
  }
  /**
   * Validate a model instance using definition of schema
   * @method
   * @public
   *
   * @example
   * ```ts
   *   const schema = new Schema([new StringType('name')]);
   *   const result = schema.validate({name: 'John Doe'});
   *   console.log(result)
   * ```
   * > true
   */
  async validate(object: Model | ModelObject): Promise<boolean> {
    let errors: string[] = [];
    for (const key in this.fields) {
      const type = this.fields[key];
      if (!isMetadataKey(type.name)) {
        const value = object[type.name];
        const result = await type.validate(value);
        errors = [...errors, ...result];
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
    return true;
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
      if (field.isEmpty(obj[field.name])) {
        obj[field.name] = field.buildDefault();
      }
    }
    return obj;
  }

  path(path: string): IOttomanType | undefined {
    return this.fields[path];
  }

  /**
   * Allow to apply plugins to extend schema and model features.
   */
  plugin(...fns: PluginConstructor[]): Schema {
    if (fns && Array.isArray(fns)) {
      for (const fn of fns) {
        fn(this);
      }
    }
    return this;
  }

  pre(hook: 'validate' | 'save' | 'remove', handler): Schema {
    if (this.preHooks[hook] === undefined) {
      this.preHooks[hook] = [];
    }
    this.preHooks[hook].push(handler);
    return this;
  }

  post(hook: 'validate' | 'save' | 'remove', handler): Schema {
    if (this.postHooks[hook] === undefined) {
      this.postHooks[hook] = [];
    }
    this.postHooks[hook].push(handler);
    return this;
  }
}
