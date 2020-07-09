import { CoreType } from './core-type';
import { Schema } from '../schema';
import { is } from '../../utils/is-type';
import { isModel } from '../../utils/is-model';
import { ValidationError } from '../errors';
import { CoreTypeOptions } from '../interfaces/schema.types';

interface ReferenceOptions {
  schema: Schema;
  refModel: string;
}

/**
 * @inheritDoc
 */
export class ReferenceType extends CoreType {
  constructor(name: string, public schema: Schema, public refModel: string, options?: CoreTypeOptions) {
    super(name, 'Reference', options);
  }

  cast(value: unknown, strategy) {
    super.cast(value, strategy);
    if (this.isEmpty(value)) return value;
    if (is(value, String)) {
      return String(value);
    }
    if (!is(value, Object) && !isModel(value)) {
      throw new ValidationError(`Property ${this.name} must be of type ${this.typeName}`);
    }
    this.checkValidator(value);
    return this.schema.cast(value);
  }
}

export const referenceTypeFactory = (name: string, opts: ReferenceOptions): ReferenceType =>
  new ReferenceType(name, opts.schema, opts.refModel);
