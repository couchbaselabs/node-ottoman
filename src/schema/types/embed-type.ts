import { CoreType } from './core-type';
import { Schema, ModelObject } from '../schema';
import { validateSchema } from '../helpers';

class EmbedType extends CoreType {
  constructor(name: string, public schema: Schema) {
    super(name, 'Embed');
  }

  async applyValidations(value: ModelObject): Promise<string[]> {
    await validateSchema(value, this.schema);
    return [];
  }

  isEmpty(): boolean {
    return false;
  }
}

export const embedTypeFactory = (name: string, schema: Schema): EmbedType => new EmbedType(name, schema);
