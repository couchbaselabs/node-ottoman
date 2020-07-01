import { applyValidator } from '../helpers';
import { BuildSchemaError, ValidationError } from '../errors';
import {
  CoreTypeOptions,
  IOttomanType,
  RequiredFunction,
  RequiredOption,
  ValidatorFunction,
  ValidatorOption,
} from '../interfaces';
import { VALIDATION_STRATEGY } from '../../utils';
import { AutoFunction } from '../interfaces/schema.types';

/**
 *  @param name of field in schema
 *  @param typeName name of type
 *  @param options
 *  @param options.required flag to define if the field is mandatory
 *  @param options.validator that will be applied to the field, allow function, object or string with the name of a custom validator
 *  @param options.default that will define the initial value to the field, allow and value or function to generate him
 *  @param options.auto that will generate the initial value to the field, if the field is String allows value 'uuid'  or a function, other cases only function. It cannot use combined with default
 */
export abstract class CoreType implements IOttomanType {
  protected constructor(public name: string, public typeName: string, public options?: CoreTypeOptions) {
    this._checkIntegrity();
  }
  get required(): boolean | RequiredOption | RequiredFunction {
    return this.options?.required || false;
  }

  get validator(): ValidatorOption | ValidatorFunction | string | undefined {
    return this.options?.validator;
  }

  get auto(): string | AutoFunction | undefined {
    return this.options?.auto;
  }

  get default(): unknown {
    return this.options?.default;
  }
  buildDefault(): unknown {
    if (typeof this.default === 'function') {
      return this.default();
    } else if (typeof this.default === 'undefined') {
      if (typeof this.auto === 'function') {
        return String(this.auto());
      }
    } else {
      return this.default;
    }
  }

  private _checkIntegrity() {
    if (this.auto !== undefined) {
      if (this.default !== undefined) {
        throw new BuildSchemaError(`Auto and default values cannot be used at the same time in property ${this.name}.`);
      }
      if (this.auto === 'uuid' && this.typeName !== String.name) {
        throw new BuildSchemaError('Automatic uuid properties must be string typed.');
      }
    }
  }

  // eslint-disable-next-line no-unused-vars
  cast(value: unknown, strategy: VALIDATION_STRATEGY): unknown {
    if (this.isEmpty(value)) {
      const _required = this.checkRequired() || '';
      if (_required.length > 0) {
        throw new ValidationError(_required);
      }
    }
    return value;
  }

  checkRequired(): string | void {
    const _required = (typeof this.required === 'function' ? this.required() : this.required) as RequiredOption;
    if (typeof _required.val !== 'undefined' && _required.val) {
      return _required.message;
    } else if (!!_required) {
      return `Property ${this.name} is required`;
    }
  }

  checkValidator(value: unknown): void {
    applyValidator(value, this.validator, this.name);
  }

  isEmpty(value: unknown): boolean {
    return value === undefined || value === null;
  }

  isStrictStrategy(strategy: VALIDATION_STRATEGY): boolean {
    return strategy == VALIDATION_STRATEGY.STRICT;
  }
}
