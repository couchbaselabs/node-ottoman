import { CoreType } from './core-type';
import { CoreTypeOptions } from '../interfaces/schema.types';
import { CAST_STRATEGY, checkCastStrategy } from '../../utils/cast-strategy';

/**
 * `Boolean` are plain JavaScript Boolean.
 *
 * ## Options
 *
 * - **required** flag to define if the field is mandatory
 * - **validator** that will be applied to the field a validation function, validation object or string with the name of the custom validator
 * - **default** that will define the initial value of the field, this option allows a value or a function
 * - **immutable** that will define this field as immutable. Ottoman prevents you from changing immutable fields if the schema as configure like strict
 *
 *
 * @example
 * ```typescript
 * const userSchema =  new Schema({
 *   isActive: Boolean,
 *   isSomething: Schema.Types.Boolean
 * })
 * ```
 *
 * ### Ottoman will cast the following values to true:
 * * true
 * * 'true'
 * * 1
 * * '1'
 * * 'yes'
 *
 * ### Ottoman will cast the following values to false:
 * * false
 * * 'false'
 * * 0
 * * '0'
 * * 'no'
 */
export class BooleanType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions) {
    super(name, BooleanType.sName, options);
  }
  static sName = Boolean.name;

  static convertToTrue = new Set([true, 'true', 1, '1', 'yes']);
  static convertToFalse = new Set([false, 'false', 0, '0', 'no']);

  cast(value, strategy = CAST_STRATEGY.DEFAULT_OR_DROP) {
    if (BooleanType.convertToTrue.has(value)) {
      return true;
    } else if (BooleanType.convertToFalse.has(value)) {
      return false;
    } else {
      return checkCastStrategy(value, strategy, this);
    }
  }

  validate(value, strategy) {
    value = super.validate(value, strategy);
    const _value = this.cast(value, strategy);
    if (_value === undefined || _value === null) return value;
    this.checkValidator(value);
    return _value;
  }

  isEmpty(value: boolean): boolean {
    return value === undefined || value === null;
  }
}

export const booleanTypeFactory = (key: string, opts: CoreTypeOptions): BooleanType => new BooleanType(key, opts);
