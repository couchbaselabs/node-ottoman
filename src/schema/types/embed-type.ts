import { CoreType } from './core-type';
import { Schema } from '../schema';
import { isModel } from '../../utils/is-model';
import { is } from '../../utils/is-type';
import { ValidationError } from '../errors';
import { CoreTypeOptions } from '../interfaces';

/**
 * @inheritDoc
 */
class EmbedType extends CoreType {
  constructor(name: string, public schema: Schema, options?: CoreTypeOptions) {
    super(name, 'Embed', options);
  }

  cast(value: unknown, strategy) {
    value = super.cast(value, strategy);
    if (this.isEmpty(value)) return value;
    if (!is(value, Object) && !isModel(value)) {
      throw new ValidationError(`Property ${this.name} must be of type ${this.typeName}`);
    }
    this.checkValidator(value);
    return this.schema.cast(value);
  }
}

export const embedTypeFactory = (name: string, schema: Schema): EmbedType => new EmbedType(name, schema);
