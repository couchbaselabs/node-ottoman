import { CoreType } from './core-type';
import { is } from '../../utils';
import { ValidationError } from '../errors';
import { CoreTypeOptions, IOttomanType } from '../interfaces/schema.types';
import { CAST_STRATEGY, checkCastStrategy, ensureArrayItemsType } from '../../utils/cast-strategy';

/**
 * Array type supports arrays of [SchemaTypes](/classes/schema.html#static-types) and arrays of subdocuments.
 * @example
 * ```typescript
 * const postSchemaDef = new Schema({
 *   postTags: [String],
 *   comments: [{ type: commentSchema, ref: 'Comment' }],
 * });
 * ```
 */
export class ArrayType extends CoreType {
  constructor(name: string, public itemType: IOttomanType, options?: CoreTypeOptions) {
    super(name, ArrayType.sName, options);
  }

  static sName = Array.name;

  cast(value: unknown, strategy = CAST_STRATEGY.DEFAULT_OR_DROP): unknown {
    if (is(value, Array)) {
      return ensureArrayItemsType(value, this.itemType, strategy);
    }
    return checkCastStrategy(value, strategy, this);
  }

  validate(value: unknown, strict = true) {
    value = super.validate(value, strict);
    if (this.isEmpty(value)) return value;
    if (!is(value, Array)) {
      throw new ValidationError(`Property ${this.name} must be of type ${this.typeName}`);
    }
    const _value = value as unknown[];
    const _valueResult: unknown[] = [];
    this.checkValidator(_value);
    for (const key in _value) {
      _valueResult.push(this.itemType.validate(_value[key], strict));
    }
    return _valueResult;
  }
}

export const arrayTypeFactory = (name: string, item: CoreType): ArrayType => new ArrayType(name, item);
