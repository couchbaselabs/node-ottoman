import { CoreType } from './core-type';
import { ModelObject, Schema } from '../schema';
import { is } from '../../utils/is-type';
import { isModel } from '../../utils/is-model';
import { ValidationError } from '../errors';

interface ReferenceOptions {
  schema: Schema;
  refModel: string;
}

class ReferenceType extends CoreType {
  constructor(name: string, public schema: Schema, public refModel: string) {
    super(name, 'Reference');
  }

  cast(value: unknown): ModelObject | string {
    if (is(value, String)) {
      return String(value);
    }
    if (!is(value, Object) && !isModel(value)) {
      throw new ValidationError(`Property ${this.name} must be type ${this.typeName}`);
    }
    const _value = value as ModelObject;
    this.schema.cast(_value);
    return _value;
  }
}

export const referenceTypeFactory = (name: string, opts: ReferenceOptions): ReferenceType =>
  new ReferenceType(name, opts.schema, opts.refModel);
