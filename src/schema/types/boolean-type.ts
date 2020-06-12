import { CoreType, CoreTypeOptions } from './core-type';
import { is } from '../../utils/is-type';
import { ValidationError } from '../errors';

export class BooleanType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions) {
    super(name, Boolean.name, options);
  }

  cast(value: unknown) {
    value = super.cast(value);
    if (value === undefined || value === null) return value;
    if (is(value, Object)) {
      throw new ValidationError(`Property ${this.name} must be type ${this.typeName}`);
    }
    return Boolean(value);
  }

  isEmpty(value: boolean): boolean {
    return value === undefined || value === null;
  }
}

export const booleanTypeFactory = (key: string, opts: CoreTypeOptions): BooleanType => new BooleanType(key, opts);
