import { CoreType } from './core-type';
import { Schema, ModelObject } from '../schema';
import { isModel } from '../../utils/is-model';
import { is } from '../../utils/is-type';
import { ValidationError } from '../errors';
import { Model } from '../../model/model';

class EmbedType extends CoreType {
  constructor(name: string, public schema: Schema) {
    super(name, 'Embed');
  }

  cast(value: unknown) {
    if (this.isEmpty(value)) return value;
    if (!is(value, Object) && !isModel(value)) {
      throw new ValidationError(`Property ${this.name} must be of type ${this.typeName}`);
    }
    this.checkValidator(value);
    const _value = value as ModelObject | Model;
    return this.schema.cast(_value);
  }
}

export const embedTypeFactory = (name: string, schema: Schema): EmbedType => new EmbedType(name, schema);
