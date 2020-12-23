import { CoreType } from './core-type';
import { Schema } from '../schema';
import { is } from '../../utils';
import { isModel } from '../../utils/is-model';
import { ValidationError } from '../errors';
import { CoreTypeOptions } from '../interfaces/schema.types';

interface ReferenceOptions {
  schema: Schema;
  refModel: string;
}

/**
 * The `Reference` type creates a relationship between two schemas.
 *
 * @example
 * ```typescript
 * const Cat = model('Cat', {name: String});
 * const schema = new Schema({
 *     type: String,
 *     isActive: Boolean,
 *     name: String,
 *     cats: [{ type: CatSchema, ref: 'Cat' }],
 *   });
 * const User = model('User', schema);
 * ```
 */
export class ReferenceType extends CoreType {
  constructor(name: string, public schema: Schema, public refModel: string, options?: CoreTypeOptions) {
    super(name, ReferenceType.sName, options);
  }
  static sName = 'Reference';

  cast(value) {
    return value;
  }

  validate(value: unknown, strategy) {
    super.validate(value, strategy);
    if (this.isEmpty(value)) return value;
    if (is(value, String)) {
      return String(value);
    }
    if (!is(value, Object) && !isModel(value)) {
      throw new ValidationError(`Property ${this.name} must be of type ${this.typeName}`);
    }
    this.checkValidator(value);
    return this.schema.validate(value);
  }
}

export const referenceTypeFactory = (name: string, opts: ReferenceOptions): ReferenceType =>
  new ReferenceType(name, opts.schema, opts.refModel);
