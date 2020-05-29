import { CoreType, CoreTypeOptions } from './core-type';

export class BooleanType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions) {
    super(name, options);
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

export const booleanTypeFactory = (key: string, opts: CoreTypeOptions): BooleanType => new BooleanType(key, opts);
