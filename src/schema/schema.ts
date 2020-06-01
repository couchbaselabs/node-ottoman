import { CoreType } from './types';
import { isMetadataKey } from '../utils/is-metadata';
import { ValidationError } from './errors';

export type SchemaDef = Record<string, any>;
export type ModelObject = Record<string, any>;
export type PluginConstructor = (Schema) => void;

export class Schema {
  /**
   * Name of id field
   */
  private _id: string;

  statics = {};
  methods = {};
  pre = {};
  post = {};

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
  constructor(private fields: CoreType[]) {
    this._id = '_id';
  }
  /**
   * Validate an model instance using definition of schema
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
  validate(object: ModelObject): boolean {
    let errors: string[] = [];
    for (const key in this.fields) {
      const type = this.fields[key];
      if (!isMetadataKey(type.name)) {
        const value = object[type.name];
        errors = [...errors, ...type.validate(value)];
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

  /**
   * Allow to apply plugins to extend schema and model features.
   */
  plugin(...fns: PluginConstructor[]): void {
    if (fns && Array.isArray(fns)) {
      for (const fn of fns) {
        fn(this);
      }
    }
  }
}
