import { CoreType } from './core-type';
import { Schema } from '../schema';
import { validateSchema } from '../helpers';

class ReferenceType extends CoreType {
  constructor(name: string, public schema: Schema) {
    super(name, 'Reference');
  }

  async applyValidations(value): Promise<string[]> {
    if (typeof value === 'string') {
      return [];
    }
    await validateSchema(value, this.schema);
    return [];
  }

  isEmpty(): boolean {
    return false;
  }

  checkType(): string[] {
    return [];
  }
}

export const referenceTypeFactory = (name: string, schema: Schema): ReferenceType => new ReferenceType(name, schema);
