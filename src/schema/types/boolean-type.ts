import { CoreType, CoreTypeOptions } from './core-type';

export class BooleanType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions) {
    super(name, options, 'Boolean');
  }

  applyValidations(value: boolean): string[] {
    const errors: string[] = [];
    if (typeof value !== 'boolean') {
      errors.push('Value must be boolean');
    }
    return errors;
  }

  isEmpty(value: boolean | undefined): boolean {
    return value === undefined;
  }
}

export const booleanTypeFactory = (key: string, opts: CoreTypeOptions): BooleanType => new BooleanType(key, opts);
