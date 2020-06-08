import { CoreType } from './core-type';

class ArrayType extends CoreType {
  constructor(name: string, private itemType: CoreType) {
    super(name, Array);
  }

  async applyValidations(value: unknown[]): Promise<string[]> {
    let errors: string[] = [];
    for (const item of value) {
      const result = await this.itemType.validate(item);
      errors = [...errors, ...result];
    }
    return errors.filter((it, i) => errors.indexOf(it) === i);
  }

  isEmpty(value: unknown[]): boolean {
    return value === undefined || value.length < 1;
  }

  checkType(value: unknown[]): string[] {
    let errors: string[] = [];
    value.forEach((item) => {
      errors = [...errors, ...this.itemType.checkType(item)];
    });
    return errors;
  }
}

export const arrayTypeFactory = (name: string, item: CoreType) => new ArrayType(name, item);
