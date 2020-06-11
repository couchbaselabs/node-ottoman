import {
  ValidatorOption,
  ValidatorFunction,
  applyValidator,
  validateRequire,
  validateType,
  RequiredFunction,
  RequiredOption,
} from '../helpers';
import { BuildSchemaError } from '../errors';

export interface CoreTypeOptions {
  required?: boolean | RequiredOption | RequiredFunction;
  default?: unknown;
  auto?: string;
  validator?: ValidatorOption | ValidatorFunction;
}

export interface IOttomanType {
  name: string;
  typeName: string;
  validate(value: unknown): Promise<string[]>;
  isEmpty(value: unknown): boolean;
  buildDefault(): unknown;
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

  /***
   * First check types and later apply specific validation of the type
   * @param {String|Date|Number} value
   * @return {String[]}
   */
  async validate(value: unknown): Promise<string[]> {
    let errors: string[] = [];
    /// Check type integrity if is not empty
    if (!this.isEmpty(value)) {
      errors = [...errors, ...this.checkType(value)];
    }
    ///Checking required data
    if (this.isEmpty(value)) {
      errors = [...errors, ...validateRequire(this.required, this.name)];
    }
    if (this.validator !== undefined) {
      const _validator = typeof this.validator === 'function' ? this.validator(value) : this.validator;
      errors = [...errors, ...applyValidator(value, _validator)];
    }
    const result = await this.applyValidations(value);
    errors = [...errors, ...result];

    return errors.filter((val) => ![, null, ''].includes(val));
  }

  buildDefault(): unknown {
    if (typeof this.default === 'function') {
      return this.default();
    } else {
      return this.default;
    }
  }

  abstract applyValidations(value): Promise<string[]>;

  abstract isEmpty(value: unknown): boolean;

  private _checkIntegrity() {
    if (this.auto !== undefined) {
      if (this.default !== undefined) {
        throw new BuildSchemaError(`Property ${this.name} cannot be both auto and have a default.`);
      }
      if (this.auto === 'uuid' && this.typeName !== String.name) {
        throw new BuildSchemaError('Automatic uuid properties must be string typed.');
      }
    }
  }

  checkType(value: unknown): string[] {
    return validateType(value, this.typeName, this.name);
  }
}
