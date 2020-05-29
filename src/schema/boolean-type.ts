import { CoreType, BooleanFunction } from './core-type';

export class BooleanType extends CoreType {
  constructor(name: string, required?: boolean | BooleanFunction, defaultValue?: unknown, auto?: unknown) {
    super(name, required, defaultValue, auto);
  }

  applyValidations(value: unknown): string[] {
    const errors: string[] = [];
    const _required = typeof this.required === 'function' ? this.required() : this.required;
    if (_required && !this.hasValue(value)) {
      errors.push(`Property ${this.name} is required`);
    }

    return errors;
  }

  protected hasValue(value: unknown): boolean {
    return typeof value === this.typeName.toLowerCase();
  }

  typeName = 'Boolean';
}

export const booleanTypeFactory = (key: string, opts): BooleanType => {
  const { required, default: defaultValue, auto } = opts || {};
  return new BooleanType(key, required, defaultValue, auto);
};
