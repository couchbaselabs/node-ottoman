import { is } from '../../utils/is-type';
import { BuildSchemaError } from '../errors';
import { Schema } from '../schema';
import { SchemaDef, IOttomanType, FieldMap, FactoryFunction, CustomValidations } from '../interfaces/schema.types';
import { VALIDATION_STRATEGY } from '../../utils';

type ParseResult = {
  [key in 'type' | 'options']: unknown;
};

/**
 * Build the fields using the given definition. If the [[obj]] is a schema instance, the data will be taken from the fields provided
 * @function
 * @public
 *
 * @param {Schema|Object} obj the definition or schema instance
 * @param strategy define validation policy
 * @returns {FieldMap}
 * @throws {Error}
 *
 * @example
 *  ```ts
 *    const fields = buildFields({name: String, hasChild: {type: Boolean, default: true}});
 *  ```
 */
export const buildFields = (obj: Schema | SchemaDef, strategy?: VALIDATION_STRATEGY): FieldMap => {
  if (obj instanceof Schema) {
    return obj.fields;
  }
  const fields: FieldMap = {};
  const keys = Object.keys(obj);
  for (const _key of keys) {
    const opts =
      obj[_key] !== undefined && obj[_key] !== null
        ? _parseType(obj[_key], strategy)
        : ({ type: false } as ParseResult);
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
 * @throws BuildSchemaError
 */
const _parseType = (value, strategy): ParseResult => {
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
          schema: new Schema(value.type, { validationStrategy: strategy }),
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
        options: new Schema(value, { validationStrategy: strategy }),
      };
    }
  } else if (is(value, Array)) {
    const childType = _parseType(value[0], strategy);
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
export const castSchema = (data, schema: Schema | SchemaDef): any => {
  const _schema = schema instanceof Schema ? schema : new Schema(schema);
  const _data = applyDefaultValue(data, _schema);
  return _schema.cast(_data);
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
  if (Schema.Types[name] !== undefined) {
    throw new Error('A type with this name has already been registered');
  }
  Schema.Types[name] = factory;
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
