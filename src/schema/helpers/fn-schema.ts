import {
  booleanTypeFactory,
  CoreType,
  dateTypeFactory,
  numberTypeFactory,
  stringTypeFactory,
  arrayTypeFactory,
  objectTypeFactory,
  modelTypeFactory,
} from '../types';
import { is, isTypeOf } from '../../utils/is-type';
import { BuildSchemaError } from '../errors';
import { Schema, SchemaDef, ModelObject } from '../schema';
import { isModel } from '../../utils/is-model';

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
  const keys = Object.keys(obj);
  for (const _key of keys) {
    const opts = _parseType(obj[_key]);
    if (!opts.type) {
      throw new BuildSchemaError(`Property ${_key} is a required type`);
    }

    let subOpts: any = {};
    if (is(opts.type, Array)) {
      subOpts = _parseType(opts.type[0]);
      opts.type = Array;
    }
    fields.push(_makeField(_key, opts, subOpts));
  }
  fields.push(stringTypeFactory('_id', { auto: 'uuid' }));
  return new Schema(fields);
};

interface GroupObject {
  type: unknown;
  fields: any;
}

const _parseType = (value): Record<string, any> => {
  if (is(value, Object)) {
    if (typeof value.type !== 'undefined') {
      return value;
    } else if (typeof value.ref !== 'undefined') {
      return {
        type: value.ref,
        byRef: true,
      };
    } else {
      const obj: GroupObject = {
        type: Object,
        fields: {},
      };

      for (const key of Object.keys(value)) {
        const objDef = _parseType(value[key]);
        obj.fields[key] = objDef;
      }

      return obj;
    }
  } else if (value.name !== undefined || is(value, Array)) {
    return { type: value };
  } else {
    return value;
  }
};

const _makeField = (name, opts, subOpts?): CoreType => {
  if (isTypeOf(opts.type, String)) {
    return stringTypeFactory(name, opts);
  } else if (isTypeOf(opts.type, Boolean)) {
    return booleanTypeFactory(name, opts);
  } else if (isTypeOf(opts.type, Number)) {
    return numberTypeFactory(name, opts);
  } else if (isTypeOf(opts.type, Date)) {
    return dateTypeFactory(name, opts);
  } else if (isTypeOf(opts.type, Array)) {
    return arrayTypeFactory(name, _makeField('', subOpts));
  } else if (isTypeOf(opts.type, Object)) {
    const subFields: CoreType[] = [];
    for (const _name of Object.keys(opts.fields)) {
      const subField = _makeField(_name, opts.fields[_name]);
      subFields.push(subField);
    }
    return objectTypeFactory(name, subFields);
  } else if (isModel(opts.type)) {
    return modelTypeFactory(name, opts.refBy || false);
  } else {
    throw new BuildSchemaError(`Invalid type specified in property "${name}"`);
  }
};

/**
 * Validate data using the schema definition
 * @param data Object with data to validate
 * @param schema Schema will be used to validate
 * @throws Error
 */
export const validateSchema = async (data: ModelObject, schema: Schema | SchemaDef): Promise<boolean> => {
  const _schema = createSchema(schema);
  return _schema.validate(data);
};

/**
 * Apply default values defined on schema to an object instance
 * @param obj reference to object instance
 * @param schema definition will be used to determine default definitions
 *
 * @example
 * ```ts
 *  const schema = {name: {type: String, default: 'John'}, hasChild: {type: Boolean, default: true}};
 *  const obj: any = applyDefaultValue(obj, schema)
 *
 *  console.log(obj);
 * ```
 */
export const applyDefaultValue = (obj: ModelObject, schema: Schema | SchemaDef): ModelObject => {
  const _schema = createSchema(schema);
  return _schema.applyDefaultsToObject(obj);
};
