import { CoreType } from './core-type';
import { Schema } from '../schema';
import { isModel } from '../../utils/is-model';
import { is } from '../../utils';
import { ValidationError } from '../errors';
import { CoreTypeOptions } from '../interfaces/schema.types';
import { cast, CAST_STRATEGY, checkCastStrategy } from '../../utils/cast-strategy';

/**
 * `EmbedType` will allow you to declare a path as another schema, set type to the sub-schema's instance.
 *
 * @example
 * ```javascript
 * const userSchema = new Schema({
 *   name: String,
 *   email: Schema.Types.String,
 *   createAt: Date,
 * });
 *
 * const schema = new Schema({
 *   ...
 *   user: userSchema
 * });
 * ```
 * Also you can use a Javascript plain Object as value for an `EmbedType`.
 * Therefore the below example will behave the same that the above example do.
 *
 * ```javascript
 * const schema = new Schema({
 *  ...
 *  user: {
 *    name: String,
 *    email: String,
 *    createAt: Date,
 *  }
 * });
 * ```
 * @tip
 * `EmbedType` will allow you to reuse easily your existing schemas into new one using composition.
 */
export class EmbedType extends CoreType {
  constructor(name: string, public schema: Schema, options?: CoreTypeOptions) {
    super(name, EmbedType.sName, options);
  }
  static sName = 'Embed';

  cast(value: unknown, strategy = CAST_STRATEGY.DEFAULT_OR_DROP): unknown {
    if (!is(value, Object) && !isModel(value)) {
      return checkCastStrategy(value, strategy, this);
    } else {
      return cast(value, this.schema, { strategy });
    }
  }

  validate(value: unknown, strategy) {
    value = super.validate(value, strategy);
    if (this.isEmpty(value)) return value;
    if (!is(value, Object) && !isModel(value)) {
      throw new ValidationError(`Property ${this.name} must be of type ${this.typeName}`);
    }
    this.checkValidator(value);
    return this.schema.validate(value);
  }
}

export const embedTypeFactory = (name: string, schema: Schema): EmbedType => new EmbedType(name, schema);
