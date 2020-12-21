import { applyDefaultValue, IOttomanType, Schema, ValidationError } from '../schema';
import { CoreType } from '../schema/types';

/**
 * Cast Strategies
 * 'keep' | 'drop' | 'throw' | 'defaultOrDrop' | 'defaultOrKeep'
 *
 *  @desc
 *  When trying to cast a value to a given type if it fail Cast Strategy will behave this ways for:
 * 'keep' -> The original value will be returned
 * 'drop' -> Return undefined and the object field will be removed.
 * 'throw' -> Throw execption 'Value couldn't be casted to given type'
 * 'defaultOrDrop' -> Try to return default value if exists, if no default value was provided for the current field then it will be removed
 * 'defaultOrDrop' -> Try to return default value if exists, if no default value was provided for the current field then it will keep original value.
 */
export enum CAST_STRATEGY {
  KEEP = 'keep',
  DROP = 'drop',
  THROW = 'throw',
  DEFAULT_OR_DROP = 'defaultOrDrop',
  DEFAULT_OR_KEEP = 'defaultOrKeep',
}

export const ensureArrayItemsType = (array, field, strategy) => array.map((item) => ensureTypes(item, field, strategy));

export const ensureTypes = (item, field: IOttomanType, strategy?: CAST_STRATEGY) => {
  if (field) {
    return field.cast(item, strategy);
  }
};

export interface CastOptions {
  strategy?: CAST_STRATEGY;
  strict?: boolean;
  skip?: string[];
}

export const cast = (
  data,
  schema,
  options: CastOptions = {
    strategy: CAST_STRATEGY.DEFAULT_OR_DROP,
    strict: true,
    skip: [],
  },
) => {
  const skip = options.skip || [];
  const strategy = options.strategy || CAST_STRATEGY.DEFAULT_OR_DROP;
  const strict = options.strict || false;
  if (strict && (strategy === CAST_STRATEGY.KEEP || strategy === CAST_STRATEGY.DEFAULT_OR_KEEP)) {
    throw new Error(`Cast Strategy 'keep' or 'defaulOrKeep' isn't support when strict is set to true.`);
  }
  const result: any = {};
  let _data = { ...data };
  const _schema = schema instanceof Schema ? schema : new Schema(schema);

  if (
    strategy === CAST_STRATEGY.DEFAULT_OR_DROP ||
    strategy === CAST_STRATEGY.DEFAULT_OR_KEEP ||
    strategy === CAST_STRATEGY.THROW
  ) {
    _data = applyDefaultValue(_data, _schema);
  }
  for (const key in _data) {
    if (_data.hasOwnProperty(key)) {
      if (_schema.fields[key] && !skip.includes(key)) {
        const field: IOttomanType = _schema.fields[key];
        const value = ensureTypes(_data[key], field, strategy);
        switch (strategy) {
          case CAST_STRATEGY.KEEP:
            result[key] = value;
            break;
          case CAST_STRATEGY.DROP:
          case CAST_STRATEGY.DEFAULT_OR_DROP:
          default:
            if (value !== undefined) {
              result[key] = value;
            }
        }
      } else {
        if (!strict || skip.includes(key)) {
          result[key] = _data[key];
        }
      }
    }
  }
  return result;
};

export const checkCastStrategy = (value, strategy, type: CoreType) => {
  switch (strategy) {
    case CAST_STRATEGY.KEEP:
    case CAST_STRATEGY.DEFAULT_OR_KEEP:
      return value;
    case CAST_STRATEGY.THROW:
      throw new ValidationError(`Property ${type.name} must be of type ${type.typeName}`);
    case CAST_STRATEGY.DROP:
    case CAST_STRATEGY.DEFAULT_OR_DROP:
    default:
      return undefined;
  }
};
