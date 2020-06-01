import { CoreType } from './core-type';
import { stringTypeFactory } from './string-type';
import { booleanTypeFactory } from './boolean-type';
import {COLLECTION_KEY} from "../utils/constants";

type SchemaDef = Record<string, any>;
type ModelObject = Record<string, any>;

/**
 * Validate data using the schema definition
 * @param data Object with data to validate
 * @param schema Schema will be use to validate
 * @throws Error
 */
export const validateSchema = (data: ModelObject, schema: Schema | SchemaDef): boolean => {
  const _schema = createSchema(schema);
  return _schema.validate(data);
};

/**
 * Supported types
 * @type String[]
 * @constant
 * @private
 */
const SUPPORTED_TYPES = ['string', 'boolean', 'object'];

/**
 * Check if a type is a valid type
 * @function
 * @private
 *
 * @param {String} type - type
 *
 * @example
 * ```ts
 *  if (isSupportedType('string')) {
 *   console.log('"string" is a valid type');
 *  }
 * ```
 */
const isSupportedType = (type: string) => SUPPORTED_TYPES.includes(type);

const getSchemaType = (v) => (v.name || v.constructor.name).toLowerCase();

/**
 * Parse definition to get a schema instance
 * @function
 * @public
 *
 * @param {Schema|Object} obj
 * @returns {Schema}
 * @throws {Error}
 *
 * @example
 *  ```ts
 *    const schema = createSchema({name: String, hasChild: {type: Boolean, default: true}});
 *  ```
 */
export const createSchema = (obj: Schema | SchemaDef): Schema => {
  if (obj instanceof Schema) {
    return obj;
  }
  const fields: CoreType[] = [];
  for (const _key in obj) {
    const value = obj[_key];

    let type = getSchemaType(value);

    if (type === 'object') {
      const { type: objType } = value;
      if (typeof objType === 'undefined') {
        throw new Error(`Property ${_key} required type`);
      }
      type = getSchemaType(objType);
    }

    if (!isSupportedType(type)) {
      throw Error(`Type ${type} isn't supported`);
    }

    switch (type.toLowerCase()) {
      case String.name.toLowerCase():
        fields.push(stringTypeFactory(_key, value));
        break;
      case Boolean.name.toLowerCase():
        fields.push(booleanTypeFactory(_key, value));
        break;
    }
  }
  return new Schema(fields);
};

/**
 * Apply default values defined on schema to an object instance
 * @param obj reference to object instance
 * @param schema definition will be use to determine default definitions
 *
 * @example
 * ```ts
 *  const schema = {name: {type: String, default: 'John'}, hasChild: {type: Boolean, default: true}};
 *  let obj: any = {};
 *  applyDefaultValue(obj, schema);
 *
 *  console.log(obj);
 * ```
 */
export const applyDefaultValue = (obj: ModelObject, schema: Schema | SchemaDef): void => {
  const _schema = createSchema(schema);
  _schema.applyDefaultsToObject(obj);
};

class Schema {
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
  constructor(private fields: CoreType[]) {}
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
  validate(object: ModelObject) {
    let errors: string[] = [];
    for (const key in this.fields) {
      const isMetadataKey = key === 'id' || key === COLLECTION_KEY
      if (!isMetadataKey) {
        const type = this.fields[key];
        const value = object[type.name];
        errors = [...errors, ...type.validate(value)];
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    return true;
  }

  /**
   * Apply default values defined on schema to an object instance
   * @method
   * @public
   * @param obj
   */
  applyDefaultsToObject(obj: ModelObject) {
    for (const key in this.fields) {
      const field = this.fields[key];
      if (field.default instanceof Function) {
        obj[field.name] = field.default();
      } else if (field.default !== undefined) {
        obj[field.name] = field.default;
      }
    }
  }
}
