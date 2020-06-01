import { CoreType } from './core-type';

class ArrayType extends CoreType {
  constructor(name: string, private itemType: CoreType) {
    super(name, undefined, 'Array');
  }

  applyValidations(value: unknown[]): string[] {
    let errors: string[] = [];
    value.forEach((item) => {
      errors = [...errors, ...this.itemType.validate(item)];
    });
    return errors.filter((it, i) => errors.indexOf(it) === i);
  }

  isEmpty(value: unknown[]): boolean {
    return value.length > 0;
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
