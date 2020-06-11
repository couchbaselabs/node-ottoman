import { CoreType, CoreTypeOptions } from './core-type';

export class BooleanType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions) {
    super(name, Boolean.name, options);
  }

  async applyValidations(): Promise<string[]> {
    return [];
  }

  isEmpty(value: boolean | undefined): boolean {
    return value === undefined;
  }
}

export const booleanTypeFactory = (key: string, opts: CoreTypeOptions): BooleanType => new BooleanType(key, opts);
