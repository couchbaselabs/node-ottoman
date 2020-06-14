import { IOttomanType } from '../types';
import { is } from '../../utils/is-type';
import { BuildSchemaError } from '../errors';
import { Schema, SchemaDef, ModelObject, FieldMap, FactoryFunction } from '../schema';
import { Model } from '../../model/model';
import { getGlobalPlugins } from '../../plugins/global-plugin-handler';

type ParseResult = {
  [key in 'type' | 'options']: unknown;
};
/**
 * Parse the definition to get a schema instance, if the [[obj]] is a schema instance will be returned
 * @function
 * @public
 *
 * @param {Schema|Object} obj the definition or schema instance
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
  const fields: FieldMap = {};
  const keys = Object.keys(obj);
  for (const _key of keys) {
    const opts = _parseType(obj[_key], _key);
    if (!opts.type) {
      throw new BuildSchemaError(`Property ${_key} is a required type`);
    }

    fields[_key] = _makeField(_key, opts);
  }
  fields['_id'] = _makeField('_id', { type: String.name, options: { auto: 'uuid' } });
  const schema = new Schema(fields);
  schema.plugin(...getGlobalPlugins());
  return schema;
};

/**
 * Parse the definition of a field in the schema to identify the type
 * @function
 * @private
 * @param value that's going to parse
 * @param name that identifies the field
 * @throws BuildSchemaError
 */
const _parseType = (value, name: string): ParseResult => {
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
          schema: createSchema(value.type),
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
        options: createSchema(value),
      };
    }
  } else if (is(value, Array)) {
    const childType = _parseType(value[0], '');
    if (!childType.type) {
      throw new BuildSchemaError(`Property ${name}.0 is a required type`);
    }
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
 * @param def result of parse the field schema
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
 * @param data that's going to be validated
 * @param schema that will be used to validate
 * @throws BuildSchemaError, ValidationError
 */
export const castSchema = (data: Model | ModelObject, schema: Schema | SchemaDef): Model | ModelObject => {
  const _schema = createSchema(schema);
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
  const _schema = createSchema(schema);
  return _schema.applyDefaultsToObject(obj);
};

export const registerType = (name: string, factory: FactoryFunction): void => {
  if (Schema.Types[name] !== undefined) {
    throw new Error('A type with this name has already been registered');
  }
  Schema.Types[name] = factory;
};
