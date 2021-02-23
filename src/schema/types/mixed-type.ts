import { CoreType } from './core-type';
import { CoreTypeOptions } from '../interfaces/schema.types';

/**
 * `Mixed` type supports any `Object` types, you can change the value to anything else you like, it can be represented in the following ways:
 *
 *  ## Options
 *
 * - **required** flag to define if the field is mandatory
 * - **validator** that will be applied to the field a validation function, validation object or string with the name of the custom validator
 * - **default** that will define the initial value of the field, this option allows a value or a function
 * - **immutable** that will define this field as immutable. Ottoman prevents you from changing immutable fields if the schema as configure like strict
 *
 * @example
 * ```typescript
 * const customSchema = new Schema({
 *   empty: {},
 *   obj: Object,
 *   mixed: Schema.Types.Mixed,
 * });
 * ```
 */
export class MixedType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions) {
    super(name, MixedType.sName, options);
  }
  static sName = 'Mixed';

  cast(value: unknown, strategy) {
    value = super.validate(value, strategy);
    this.checkValidator(value);
    return value;
  }
}

export const mixedTypeFactory = (name: string, otps: CoreTypeOptions): MixedType => new MixedType(name, otps);
