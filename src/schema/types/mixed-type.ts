import { CoreType } from './core-type';
import { CoreTypeOptions } from '../interfaces/schema.types';

/**
 * @inheritDoc
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
