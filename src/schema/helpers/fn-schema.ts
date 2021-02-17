import { is, isSchemaFactoryType } from '../../utils';
import { BuildSchemaError, ValidationError } from '../errors';
import { Schema } from '../schema';
import { CoreType } from '../types';
import { CustomValidations, FactoryFunction, FieldMap, IOttomanType, SchemaDef } from '../interfaces/schema.types';
import { cast, CAST_STRATEGY } from '../../utils/cast-strategy';

type ParseResult = {
  [key in 'type' | 'options']: unknown;
};

/**
 * Build the fields using the given definition. If the [[obj]] is a schema instance, the data will be taken from the fields provided
 * @function
 * @public
 *
 * @param {Schema|Object} obj the definition or schema instance
 * @param strict will drop all property not defined in schema
 * @returns {FieldMap}
 * @throws {Error}
 *
 * @example
 *  ```ts
 *    const fields = buildFields({name: String, hasChild: {type: Boolean, default: true}});
 *  ```
 */
export const buildFields = (obj: Schema | SchemaDef, strict = true): FieldMap => {
  if (obj instanceof Schema) {
    return obj.fields;
  }
  const fields: FieldMap = {};
  const keys = Object.keys(obj);
  for (const _key of keys) {
    const opts =
      obj[_key] !== undefined && obj[_key] !== null ? _parseType(obj[_key], strict) : ({ type: false } as ParseResult);
    if (!opts.type) {
      throw new BuildSchemaError(`Property ${_key} is a required type`);
    }
    fields[_key] = _makeField(_key, opts);
  }
  return fields;
};

/**
 * Parse the definition of a field in the schema to identify its type
 * @function
 * @private
 * @param value that is going to parsed
 * @param strict Schema Validation Strategy Strict
 * @throws BuildSchemaError
 */
const _parseType = (value, strict = true): ParseResult => {
  if (value instanceof Schema) {
    return _makeParseResult('Embed', value);
  } else if (is(value, Array)) {
    return _makeParseResult(Array.name, _makeField('', _parseType(value[0], strict)));
  } else if (value instanceof CoreType || isSchemaFactoryType(value, Schema.FactoryTypes)) {
    return _makeParseResult(_getFieldType(value), {});
  } else if (is(value, Object)) {
    if (Object.keys(value).length === 0) {
      return _makeParseResult('Mixed', value);
    } else if (value.ref) {
      const options = {
        schema: new Schema(value.type, { strict }),
        refModel: value.ref,
      };
      return _makeParseResult('Reference', options);
    } else if (typeof value.type !== 'undefined') {
      if (is(value.type, Array)) {
        return _makeParseResult(Array.name, _makeField('', _parseType(value.type[0], strict)));
      }
      return { ..._parseType(value.type, strict), ...{ options: value } };
    } else {
      return _makeParseResult('Embed', new Schema(value, { strict }));
    }
  } else {
    return _makeParseResult('Unknown', value);
  }
};

/**
 * Create the Structure of schema object.
 * @private
 * @param type of the field
 * @param options of the schema
 * */
const _makeParseResult = (type: string, options): ParseResult => {
  return { type, options };
};

/**
 * Get the string type of a field
 * @private
 * @param type of the field
 * */
const _getFieldType = (type: any): any => {
  return type ? type.name || type.constructor['sName'] || undefined : undefined;
};

/**
 * Make a field using its definition, throw a [[BuildSchemaError]] if the type is not supported
 * @private
 * @param name of the field
 * @param def result of parsing the field schema
 * @throws BuildSchemaError
 */
const _makeField = (name: string, def: ParseResult): IOttomanType => {
  const typeFactory = Schema.FactoryTypes[String(def.type)];
  if (typeFactory === undefined) {
    throw new BuildSchemaError(`Unsupported type specified in the property "${name}"`);
  }
  return typeFactory(name, def.options);
};
/**
 * Validate data using the schema definition
 * @param data that is going to be validated
 * @param schema that will be used to validate
 * @param options
 * @throws BuildSchemaError, ValidationError
 * @example
 * ```ts
 *    const data = {
 *      name: "John",
 *      age: "50"
 *    };
 *    const schema = new Schema({
 *      name: String,
 *      age: {type: Number, intVal: true}
 *    });
 *    const strictSchema = new Schema({
 *      name: String,
 *      age: {type: Number, intVal: true}
 *     },
 *     {
 *      validationStrategy: VALIDATION_STRATEGY.STRICT
 *     });
 *    console.log(castSchema(data, schema)); // Print {name: "John", age: 50}
 *    console.log(castSchema(data, strictSchema)); // Throw "Property age must be of type Number"
 * ```
 */
export const validate = (
  data,
  schema: Schema | SchemaDef,
  options: { strategy?: CAST_STRATEGY; strict?: boolean; skip?: string[] } = {
    strategy: CAST_STRATEGY.THROW,
    strict: true,
    skip: [],
  },
): any => {
  const _schema = schema instanceof Schema ? schema : new Schema(schema);
  const _data = cast(data, _schema, options);
  const skip = options.skip || [];
  const errors: string[] = [];
  for (const key in _schema.fields) {
    const type = _schema.fields[key];
    if (!skip.includes(type.name)) {
      try {
        const value = _data[type.name];
        type.validate(value, options.strict);
      } catch (e) {
        errors.push(e.message);
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }
  return _data;
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
export const applyDefaultValue = (obj, schema: Schema | SchemaDef): any => {
  const _schema = schema instanceof Schema ? schema : new Schema(schema);
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
  if (Schema.FactoryTypes[name] !== undefined) {
    throw new ValidationError(`A type with name '${name}' has already been registered`);
  }
  Schema.FactoryTypes[name] = factory;
};

/**
 * Register custom validators to Schema validators register.
 * @function
 * @param validators
 * @throws Error
 * @example
 *  ```ts
 *    addValidators({
 *      email: (value) => {
 *        regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
 *        if (!regexp.test(value)) {
 *          throw new Error('Email address is invalid.')
 *        }
 *      }
 *    });
 *
 *    const ContactSchema = new Schema({
 *      name: String,
 *      contact: { type: String, validator: 'email' }
 *    });
 *  ```
 */
export const addValidators = (validators: CustomValidations): void => {
  if (!is(validators, Object)) {
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

export const mergeHooks = (hook: Record<string, unknown[]>, other: Record<string, unknown[]>) => {
  const _hook = { ...hook };
  Object.keys(_hook).forEach((value: string) => {
    if (other.hasOwnProperty(value)) {
      _hook[value] = [..._hook[value], ...other[value]];
    }
  });
  return _hook;
};
