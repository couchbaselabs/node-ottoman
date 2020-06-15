import { ValidatorOption, ValidatorFunction, applyValidator } from '../helpers';
import { BuildSchemaError, ValidationError } from '../errors';

export interface RequiredOption {
  val: boolean;
  message: string;
}
export type RequiredFunction = () => boolean | RequiredOption;

export interface CoreTypeOptions {
  required?: boolean | RequiredOption | RequiredFunction;
  default?: unknown;
  auto?: string;
  validator?: ValidatorOption | ValidatorFunction;
}

export interface IOttomanType {
  name: string;
  typeName: string;
  cast(value: unknown): unknown;
}

export abstract class CoreType implements IOttomanType {
  protected constructor(public name: string, public typeName: string, public options?: CoreTypeOptions) {
    this._checkIntegrity();
  }
  get required(): boolean | RequiredOption | RequiredFunction {
    return this.options?.required || false;
  }

  get validator(): ValidatorOption | ValidatorFunction | undefined {
    return this.options?.validator;
  }

  get auto(): string | undefined {
    return this.options?.auto;
  }

  get default(): unknown {
    return this.options?.default;
  }
  buildDefault(): unknown {
    if (typeof this.default === 'function') {
      return this.default();
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

  cast(value: unknown): unknown {
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

  checkValidator(value: unknown): string | void {
    const _validator = (typeof this.validator === 'function'
      ? this.validator(value)
      : this.validator) as ValidatorOption;
    return applyValidator(value, _validator);
  }

  isEmpty(value: unknown): boolean {
    return value === undefined || value === null;
  }
}
