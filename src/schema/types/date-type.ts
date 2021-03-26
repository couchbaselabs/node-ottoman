import { CoreType } from './core-type';
import { DateFunction, DateOption, validateMaxDate, validateMinDate } from '../helpers';
import { ValidationError } from '../errors';
import { CoreTypeOptions } from '../interfaces/schema.types';
import { is } from '../../utils';
import { CAST_STRATEGY, checkCastStrategy } from '../../utils/cast-strategy';
import { isDateValid } from '../../utils/type-helpers';

/**
 * @field `min` date value that will be accepted
 * @field `max` date value that will be accepted
 * */
interface DateTypeOptions {
  min?: Date | DateOption | DateFunction | string;
  max?: Date | DateOption | DateFunction | string;
}

/**
 * `Date` are plain javascript date
 *
 * ## Options
 *
 * - **required** flag to define if the field is mandatory
 * - **validator** that will be applied to the field a validation function, validation object or string with the name of the custom validator
 * - **default** that will define the initial value of the field, this option allows a value or a function
 * - **immutable** that will define this field as immutable. Ottoman prevents you from changing immutable fields if the schema as configure like strict
 * - **min** minimum date value that will be accepted
 * - **max** maximum date value that will be accepted
 *
 * @example
 * ```typescript
 * const userSchema =  new Schema({
 *   birthday: {type: Date, min: '1990-12-31', max: new Date()},
 *   hired: Schema.Types.Date
 * })
 * ```
 */
export class DateType extends CoreType {
  constructor(name: string, options?: DateTypeOptions & CoreTypeOptions) {
    super(name, DateType.sName, options);
  }

  static sName = Date.name;

  get min(): Date | DateOption | DateFunction | undefined {
    const _min = (this.options as DateTypeOptions).min;
    if (typeof _min === 'string') {
      return new Date(String(_min));
    }
    return _min;
  }

  get max(): Date | DateOption | DateFunction | undefined {
    const _max = (this.options as DateTypeOptions).max;
    if (typeof _max === 'string') {
      return new Date(String(_max));
    }
    return _max;
  }

  buildDefault(): Date | undefined {
    const result: any = super.buildDefault();
    if (result) {
      return !(result instanceof Date) ? new Date(String(result)) : (result as Date);
    }
    return result;
  }

  cast(value: any, strategy = CAST_STRATEGY.DEFAULT_OR_DROP) {
    if (isDateValid(value)) {
      return new Date(value);
    } else {
      return checkCastStrategy(value, strategy, this);
    }
  }

  validate(value: unknown, strategy) {
    value = super.validate(value, strategy);
    if (this.isEmpty(value)) return value;
    const _value = this.isStrictStrategy(strategy)
      ? is(value, Date)
        ? (value as Date)
        : undefined
      : is(value, Date)
      ? (value as Date)
      : is(value, String)
      ? new Date(String(value))
      : is(value, Number)
      ? new Date(Number(value))
      : undefined;
    if (_value === undefined) {
      throw new ValidationError(`Property '${this.name}' must be of type '${this.typeName}'`);
    }
    this.checkValidator(_value);
    let errors: string[] = [];
    errors.push(this._checkMinDate(_value));
    errors.push(this._checkMaxDate(_value));
    errors = errors.filter((e) => e !== '');
    if (errors.length > 0) {
      throw new ValidationError(errors.join('\n'));
    }
    return _value;
  }

  private _checkMinDate(val: Date): string {
    const _min = typeof this.min === 'function' ? this.min() : this.min;
    if (_min === undefined) {
      return '';
    }
    return validateMinDate(val, _min, this.name) || '';
  }

  private _checkMaxDate(val: Date): string {
    const _max = typeof this.max === 'function' ? this.max() : this.max;
    if (_max === undefined) {
      return '';
    }
    return validateMaxDate(val, _max, this.name) || '';
  }
}

export const dateTypeFactory = (name: string, opts: DateTypeOptions & CoreTypeOptions): DateType =>
  new DateType(name, opts);
