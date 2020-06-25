import { CoreType } from './core-type';
import { is } from '../../utils/is-type';
import { ValidationError } from '../errors';
import { CoreTypeOptions } from '../interfaces';

export class BooleanType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions) {
    super(name, Boolean.name, options);
  }

  cast(value, strategy) {
    value = super.cast(value, strategy);
    if (value === undefined || value === null) return value;
    const _wrongType = this.isStrictStrategy(strategy) ? !is(value, Boolean) : is(value, Object);
    if (_wrongType) {
      throw new ValidationError(`Property ${this.name} must be of type ${this.typeName}`);
    }
    this.checkValidator(value);
    return Boolean(value);
  }

  isEmpty(value: boolean): boolean {
    return value === undefined || value === null;
  }
}

export const booleanTypeFactory = (key: string, opts: CoreTypeOptions): BooleanType => new BooleanType(key, opts);
