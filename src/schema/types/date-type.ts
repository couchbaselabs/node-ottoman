import { CoreType, CoreTypeOptions } from './core-type';
import { DateFunction, DateOption, validateMaxDate, validateMinDate } from '../helpers';

interface DateTypeOptions {
  min?: Date | DateOption | DateFunction | string;
  max?: Date | DateOption | DateFunction | string;
}
class DateType extends CoreType {
  constructor(name: string, options?: DateTypeOptions & CoreTypeOptions) {
    super(name, options, 'Date');
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

  applyValidations(value: Date): string[] {
    let errors: string[] = [];
    if (this.min !== undefined) {
      errors = [...errors, ...validateMinDate(value, typeof this.min === 'function' ? this.min() : this.min)];
    }
    if (this.max !== undefined) {
      errors = [...errors, ...validateMaxDate(value, typeof this.max === 'function' ? this.max() : this.max)];
    }
    return errors;
  }

  isEmpty(value: Date): boolean {
    return value === undefined;
  }
}

export const dateTypeFactory = (name: string, options: DateTypeOptions & CoreTypeOptions): DateType =>
  new DateType(name, options);
