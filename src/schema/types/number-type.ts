import { CoreType } from './core-type';
import { MinmaxOption, NumberFunction, validateMaxLimit, validateMinLimit } from '../helpers';
import { ValidationError } from '../errors';
import { CoreTypeOptions } from '../interfaces/schema.types.js';
import { is } from '../../utils';
import { CAST_STRATEGY, checkCastStrategy } from '../../utils/cast-strategy';
import { isNumber } from '../../utils/type-helpers';

interface NumberTypeOptions {
  intVal?: boolean;
  min?: number | NumberFunction | MinmaxOption;
  max?: number | NumberFunction | MinmaxOption;
}
/**
 * @inheritDoc
 * @param options.intVal flag that will allow only integer values
 * @param options.min numeric value that will be accepted
 * @param options.max numeric value that will be accepted
 */
export class NumberType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions & NumberTypeOptions) {
    super(name, NumberType.sName, options);
  }
  static sName = Number.name;

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

  cast(value: unknown, strategy = CAST_STRATEGY.DEFAULT_OR_DROP): unknown {
    const castedValue = Number(value);
    if (isNumber(castedValue)) {
      return castedValue;
    } else {
      return checkCastStrategy(value, strategy, this);
    }
  }

  validate(value: unknown, strategy) {
    value = super.validate(value, strategy);
    if (this.isEmpty(value)) return value;
    const _value = Number(value);
    let errors: string[] = [];
    const _wrongType = this.isStrictStrategy(strategy) ? !is(value, Number) : isNaN(_value);
    if (_wrongType) {
      throw new ValidationError(`Property ${this.name} must be of type ${this.typeName}`);
    }

    if (this.intVal && _value % 1 !== 0) {
      errors.push(`Property ${this.name} only allows Integer values`);
    }
    this.checkValidator(_value);
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
