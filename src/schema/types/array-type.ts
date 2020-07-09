import { CoreType } from './core-type';
import { is } from '../../utils/is-type';
import { ValidationError } from '../errors';
import { CoreTypeOptions, IOttomanType } from '../interfaces/schema.types';
import { VALIDATION_STRATEGY } from '../../utils';

/**
 * @inheritDoc
 */
class ArrayType extends CoreType {
  constructor(name: string, private itemType: IOttomanType, options?: CoreTypeOptions) {
    super(name, Array.name, options);
  }

  cast(value: unknown, strategy: VALIDATION_STRATEGY) {
    value = super.cast(value, strategy);
    if (this.isEmpty(value)) return value;
    if (!is(value, Array)) {
      throw new ValidationError(`Property ${this.name} must be of type ${this.typeName}`);
    }
    const _value = value as unknown[];
    const _valueResult: unknown[] = [];
    this.checkValidator(_value);
    for (const key in _value) {
      _valueResult.push(this.itemType.cast(_value[key], strategy));
    }
    return _valueResult;
  }
}

export const arrayTypeFactory = (name: string, item: CoreType): ArrayType => new ArrayType(name, item);
