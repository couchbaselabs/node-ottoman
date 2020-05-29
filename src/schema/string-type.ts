import { CoreType, CoreTypeOptions } from './core-type';

type FunctionsString = () => string[];

interface StringTypeOptions {
  enum?: string[] | FunctionsString;
}

export class StringType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions & StringTypeOptions) {
    super(name, options);
  }

  get enumValues(): unknown {
    const _options = this.options as StringTypeOptions;
    return _options.enum;
  }

  applyValidations(value: unknown): string[] {
    const _value = String(value);
    const errors: string[] = [];
    const _required = typeof this.required === 'function' ? this.required() : this.required;
    if (_required && !this.hasValue(_value)) {
      errors.push(`Property ${this.name} is required`);
    }
    if (typeof this.enumValues !== 'undefined') {
      const _enumValues = typeof this.enumValues === 'function' ? this.enumValues() : this.enumValues;
      if (!_enumValues.includes(_value)) {
        errors.push(`Property ${this.name} value must be ${_enumValues.join(',')}`);
      }
    }
    return errors;
  }

  protected hasValue(value: unknown): boolean {
    return (typeof value === 'string' || value instanceof String) && value.length > 0;
  }

  typeName = 'String';
}

export const stringTypeFactory = (key: string, opts: StringTypeOptions & CoreTypeOptions) => new StringType(key, opts);
