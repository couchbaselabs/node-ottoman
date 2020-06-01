import { CoreType } from './core-type';

type Group = Record<string, any>;

class ObjectType extends CoreType {
  constructor(name: string, public fields: CoreType[]) {
    super(name, {}, 'Object');
  }

  applyValidations(value: Group): string[] {
    let errors: string[] = [];
    this.fields.forEach((fi) => {
      errors = [...errors, ...fi.validate(value[fi.name])];
    });
    return errors;
  }

  isEmpty(value: Group): boolean {
    return this.fields.every((fi) => fi.isEmpty(value[fi.name]));
  }
}

export const objectTypeFactory = (name: string, fields: CoreType[]): ObjectType => new ObjectType(name, fields);
