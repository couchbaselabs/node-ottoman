import { IOttomanType } from '../types';
import { is } from '../../utils/is-type';
import { BuildSchemaError } from '../errors';
import { Schema, SchemaDef, ModelObject, FieldMap, FactoryFunction, CustomValidations } from '../schema';
import { Model } from '../..';

type ParseResult = {
  [key in 'type' | 'options']: unknown;
};

/**
 * Build the fields using the given definition, if the [[obj]] is a schema instance, the data will be taken from the fields provided
 * @function
 * @public
 *
 * @param {Schema|Object} obj the definition or schema instance
 * @returns {FieldMap}
 * @throws {Error}
 *
 * @example
 *  ```ts
 *    const fields = buildFields({name: String, hasChild: {type: Boolean, default: true}});
 *  ```
 */
export const buildFields = (obj: Schema | SchemaDef): FieldMap => {
  if (obj instanceof Schema) {
    return obj.fields;
  }
  const fields: FieldMap = {};
  const keys = Object.keys(obj);
  for (const _key of keys) {
    const opts =
      obj[_key] !== undefined && obj[_key] !== null ? _parseType(obj[_key]) : ({ type: false } as ParseResult);
    if (!opts.type) {
      throw new BuildSchemaError(`Property ${_key} is a required type`);
    }
    fields[_key] = _makeField(_key, opts);
  }
  fields['_id'] = _makeField('_id', { type: String.name, options: { auto: 'uuid' } });
  return fields;
};

/**
 * Parse the definition of a field in the schema to identify its type
 * @function
 * @private
 * @param value that is going to parsed
 * @throws BuildSchemaError
 */
const _parseType = (value): ParseResult => {
  if (value instanceof Schema) {
    return {
      type: 'Embed',
      options: value,
    };
  } else if (is(value, Object)) {
    if (typeof value.ref !== 'undefined') {
      return {
        type: 'Reference',
        options: {
          schema: new Schema(value.type),
          refModel: value.ref,
        },
      };
    } else if (typeof value.type !== 'undefined') {
      return {
        type: value.type.name,
        options: value,
      };
    } else {
      return {
        type: 'Embed',
        options: new Schema(value),
      };
    }
  } else if (is(value, Array)) {
    const childType = _parseType(value[0]);
    return {
      type: Array.name,
      options: _makeField('', childType),
    };
  } else if (value.name !== undefined) {
    return {
      type: value.name,
      options: {},
    };
  } else {
    return value;
  }
};

/**
 * Make a field using its definition, throw a [[BuildSchemaError]] if the type is not supported
 * @private
 * @param name of the field
 * @param def result of parsing the field schema
 */
const _makeField = (name: string, def: ParseResult): IOttomanType => {
  const typeFactory = Schema.Types[String(def.type)];
  if (typeFactory === undefined) {
    throw new BuildSchemaError(`Unsupported type specified in the property "${name}"`);
  }
  return typeFactory(name, def.options);
};
/**
 * Validate data using the schema definition
 * @param data that is going to be validated
 * @param schema that will be used to validate
 * @throws BuildSchemaError, ValidationError
 */
export const castSchema = (data: Model | ModelObject, schema: Schema | SchemaDef): Model | ModelObject => {
  const _schema = new Schema(schema);
  return _schema.cast(data);
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
  const _schema = new Schema(schema);
  return _schema.applyDefaultsToObject(obj);
};
/**
 * Register a custom type to Schema supported types.
 * @function
 * @param name
 * @param factory
 * @throws Error
 * @example
 *  ```ts
 *    registerType(Int8.name, (fieldName, opts) => new Int8(fieldName, opts.required));
 *  ```
 */
export const registerType = (name: string, factory: FactoryFunction): void => {
  if (Schema.Types[name] !== undefined) {
    throw new Error('A type with this name has already been registered');
  }
  Schema.Types[name] = factory;
};

export const addValidators = (validators: CustomValidations) => {
  if (typeof validators !== 'object') {
    throw new BuildSchemaError('Validators must be an object.');
  }

  for (const prop in validators) {
    const validator = validators[prop];
    if (typeof validator !== 'function') {
      throw new BuildSchemaError('Validator object properties must be functions.');
    }
    Schema.validators[prop] = validator;
  }
};
