import { CoreType, CoreTypeOptions } from './core-type';
import { MinmaxOption, NumberFunction, validateMaxLimit, validateMinLimit } from '../helpers';

interface NumberTypeOptions {
  intVal?: boolean;
  min?: number | NumberFunction | MinmaxOption;
  max?: number | NumberFunction | MinmaxOption;
}

class NumberType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions & NumberTypeOptions) {
    super(name, Number, options);
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

  async applyValidations(value: number): Promise<string[]> {
    const errors: string[] = [];
    if (this.intVal && value % 1 !== 0) {
      errors.push(`Property ${this.name} only allow Integer values`);
    }
    const _min = typeof this.min === 'function' ? this.min() : this.min;
    const _minResult = validateMinLimit(value, _min);
    if (typeof _minResult === 'string') {
      errors.push(_minResult);
    }
    const _max = typeof this.max === 'function' ? this.max() : this.max;
    const _maxResult = validateMaxLimit(value, _max);
    if (typeof _maxResult === 'string') {
      errors.push(_maxResult);
    }
    return errors;
  }

  isEmpty(value: number) {
    return typeof value === 'undefined';
  }
}

export const numberTypeFactory = (name: string, otps: CoreTypeOptions & NumberTypeOptions) =>
  new NumberType(name, otps);
