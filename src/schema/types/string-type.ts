import { CoreType, CoreTypeOptions } from './core-type';
import { generateUUID } from '../../utils/generate-uuid';
import { is } from '../../utils/is-type';
import { ValidationError } from '../errors';

type FunctionsString = () => string[];

export interface StringTypeOptions {
  enum?: string[] | FunctionsString;
}

export class StringType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions & StringTypeOptions) {
    super(name, String.name, options);
  }

  get enumValues(): unknown {
    const _options = this.options as StringTypeOptions;
    return _options.enum;
  }

  buildDefault(): string {
    if (this.auto === 'uuid') {
      return generateUUID();
    }
    return String(super.buildDefault());
  }

  cast(value: unknown): string | null | undefined {
    value = super.cast(value);
    let errors: string[] = [];
    if (is(value, Object)) {
      throw new ValidationError(`Property ${this.name} must be type ${this.typeName}`);
    }
    if (value === null || value === undefined) {
      return value;
    }
    const _value = String(value);
    errors.push(this._checkEnum(_value) || '');
    errors.push(this.checkValidator(_value) || '');
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

  isEmpty(value: string): boolean {
    return [, null, ''].includes(value);
  }
}

export const stringTypeFactory = (key: string, opts: StringTypeOptions & CoreTypeOptions): StringType =>
  new StringType(key, opts);
