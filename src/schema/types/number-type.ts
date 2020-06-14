import { CoreType, CoreTypeOptions } from './core-type';
import { MinmaxOption, NumberFunction, validateMaxLimit, validateMinLimit } from '../helpers';
import { ValidationError } from '../errors';

interface NumberTypeOptions {
  intVal?: boolean;
  min?: number | NumberFunction | MinmaxOption;
  max?: number | NumberFunction | MinmaxOption;
}

class NumberType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions & NumberTypeOptions) {
    super(name, Number.name, options);
  }

  get max(): number | NumberFunction | MinmaxOption | undefined {
    const _options = this.options as NumberTypeOptions;
    return _options.max;
  }

  get min(): number | NumberFunction | MinmaxOption | undefined {
    const _options = this.options as NumberTypeOptions;
    return _options.min;
  }

  get intVal(): boolean {
    const _options = this.options as NumberTypeOptions;
    return typeof _options.intVal === 'undefined' ? false : _options.intVal;
  }

  cast(value: unknown) {
    const _value = Number(super.cast(value));
    if (this.isEmpty(value)) return _value;
    let errors: string[] = [];

    if (isNaN(_value)) {
      throw new ValidationError(`Property ${this.name} must be of type ${this.typeName}`);
    }

    if (this.intVal && _value % 1 !== 0) {
      errors.push(`Property ${this.name} only allow Integer values`);
    }

    errors.push(this._checkMin(_value));
    errors.push(this._checkMax(_value));
    errors = errors.filter((e) => e !== '');
    if (errors.length > 0) {
      throw new ValidationError(errors.join('\n'));
    }

    return _value;
  }
  private _checkMin(val: number): string {
    const _min = typeof this.min === 'function' ? this.min() : this.min;
    return validateMinLimit(val, _min) || '';
  }

  private _checkMax(val: number): string {
    const _max = typeof this.max === 'function' ? this.max() : this.max;
    return validateMaxLimit(val, _max) || '';
  }
}

export const numberTypeFactory = (name: string, otps: CoreTypeOptions & NumberTypeOptions): NumberType =>
  new NumberType(name, otps);
