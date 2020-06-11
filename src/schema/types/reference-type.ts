import { CoreType } from './core-type';
import { Schema } from '../schema';
import { validateSchema } from '../helpers';

interface ReferenceOptions {
  schema: Schema;
  refModel: string;
}

class ReferenceType extends CoreType {
  constructor(name: string, public schema: Schema, public refModel: string) {
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

export const referenceTypeFactory = (name: string, opts: ReferenceOptions): ReferenceType =>
  new ReferenceType(name, opts.schema, opts.refModel);
