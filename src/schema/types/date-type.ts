import { CoreType, CoreTypeOptions } from './core-type';
import { DateFunction, DateOption, validateMaxDate, validateMinDate } from '../helpers';
import { is } from '../../utils/is-type';
import { ValidationError } from '../errors';

interface DateTypeOptions {
  min?: Date | DateOption | DateFunction | string;
  max?: Date | DateOption | DateFunction | string;
}
class DateType extends CoreType {
  constructor(name: string, options?: DateTypeOptions & CoreTypeOptions) {
    super(name, Date.name, options);
  }

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
  buildDefault(): Date {
    const result = super.buildDefault();
    return !(result instanceof Date) ? new Date(String(result)) : (result as Date);
  }
  cast(value: unknown) {
    value = super.cast(value);
    if (this.isEmpty(value)) return value;
    const _value = is(value, Date)
      ? (value as Date)
      : is(value, String)
      ? new Date(String(value))
      : is(value, Number)
      ? new Date(Number(value))
      : undefined;
    if (_value === undefined) {
      throw new ValidationError(`Property ${this.name} must be of type ${this.typeName}`);
    }
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
    return validateMinDate(val, _min) || '';
  }

  private _checkMaxDate(val: Date): string {
    const _max = typeof this.max === 'function' ? this.max() : this.max;
    if (_max === undefined) {
      return '';
    }
    return validateMaxDate(val, _max) || '';
  }
}

export const dateTypeFactory = (name: string, opts: DateTypeOptions & CoreTypeOptions): DateType =>
  new DateType(name, opts);
