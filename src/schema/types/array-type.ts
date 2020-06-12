import { CoreType, IOttomanType } from './core-type';
import { is } from '../../utils/is-type';
import { ValidationError } from '../errors';

class ArrayType extends CoreType {
  constructor(name: string, private itemType: IOttomanType) {
    super(name, Array.name);
  }

  cast(value: unknown): unknown[] {
    if (!is(value, Array)) {
      throw new ValidationError(`Property ${this.name} must be type ${this.typeName}`);
    }
    const _value = value as unknown[];
    const _valueResult: unknown[] = [];
    for (const key in _value) {
      _valueResult.push(this.itemType.cast(_value[key]));
    }
    return _valueResult;
  }
}

export const arrayTypeFactory = (name: string, item: CoreType): ArrayType => new ArrayType(name, item);
