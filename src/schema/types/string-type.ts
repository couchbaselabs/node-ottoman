import { CoreType } from './core-type';
import { generateUUID } from '../../utils/generate-uuid';
import { is } from '../../utils';
import { BuildSchemaError, ValidationError } from '../errors';
import { AutoFunction, CoreTypeOptions } from '../interfaces/schema.types';
import { CAST_STRATEGY, checkCastStrategy } from '../../utils/cast-strategy';

type FunctionsString = () => string[];

export interface StringTypeOptions {
  enum?: string[] | FunctionsString;
  auto?: string;
}

/**
 * @inheritDoc
 * @param options.enum defines a list of allowed values.
 * @param options.auto that will generate the initial value of the field. It allows the value 'uuid' or a function. It cannot be used combined with default.
 */
export class StringType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions & StringTypeOptions) {
    super(name, StringType.sName, options);
    this._checkIntegrity();
  }

  static sName = String.name;

  get enumValues(): unknown {
    const _options = this.options as StringTypeOptions;
    return _options.enum;
  }

  get auto(): string | AutoFunction | undefined {
    return (this.options as StringType)?.auto;
  }

  buildDefault(): string | undefined {
    if (this.auto === 'uuid') {
      return generateUUID();
    }
    const _value = super.buildDefault();
    return typeof _value === 'undefined' ? _value : String(_value);
  }

  cast(value: unknown, strategy = CAST_STRATEGY.DEFAULT_OR_DROP) {
    const castedValue = String(value);
    if (is(castedValue, String) && !is(value, Object)) {
      return castedValue;
    } else {
      return checkCastStrategy(value, strategy, this);
    }
  }

  validate(value: unknown, strategy) {
    super.validate(value, strategy);
    const _wrongType = this.isStrictStrategy(strategy) ? !is(value, String) : is(value, Object);
    if (_wrongType) {
      throw new ValidationError(`Property ${this.name} must be of type ${this.typeName}`);
    }
    if (value === null || value === undefined) {
      return value;
    }
    let errors: string[] = [];
    const _value = String(value);
    errors.push(this._checkEnum(_value) || '');
    this.checkValidator(_value);
    errors = errors.filter((e) => e !== '');
    if (errors.length > 0) {
      throw new ValidationError(errors.join('\n'));
    }
    return _value;
  }

  private _checkEnum(value: string): string | void {
    if (typeof this.enumValues !== 'undefined') {
      const _enumValues = typeof this.enumValues === 'function' ? this.enumValues() : this.enumValues;
      if (!_enumValues.includes(value)) {
        return `Property ${this.name} value must be ${_enumValues.join(',')}`;
      }
    }
  }

  private _checkIntegrity() {
    if (this.auto !== undefined) {
      if (this.default !== undefined) {
        throw new BuildSchemaError(`Auto and default values cannot be used at the same time in property ${this.name}.`);
      }
      if (this.auto === 'uuid' && this.typeName !== String.name) {
        throw new BuildSchemaError('Automatic uuid properties must be string typed.');
      }
    }
  }

  isEmpty(value: string): boolean {
    return [, null, ''].includes(value);
  }
}

export const stringTypeFactory = (key: string, opts: StringTypeOptions & CoreTypeOptions): StringType =>
  new StringType(key, opts);
