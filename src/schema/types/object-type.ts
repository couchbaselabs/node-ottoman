import { CoreType } from './core-type';

type Group = Record<string, any>;

class ObjectType extends CoreType {
  constructor(name: string, public fields: CoreType[]) {
    super(name, Object);
  }

  async applyValidations(value: Group): Promise<string[]> {
    let errors: string[] = [];
    for (const fi of this.fields) {
      const result = await fi.validate(value[fi.name]);
      errors = [...errors, ...result];
    }
    return errors;
  }

  isEmpty(value: Group): boolean {
    return this.fields.every((fi) => fi.isEmpty(value[fi.name]));
  }
}

export const objectTypeFactory = (name: string, fields: CoreType[]): ObjectType => new ObjectType(name, fields);
