export type BooleanFunction = () => boolean;

/**
 * Should return string[] with all errors detected
 */
export type ValidationFunction = (value: unknown) => string[] | void;
export type Validator = Record<string, RegExp> | ValidationFunction;

export interface CoreTypeOptions {
  required?: boolean | BooleanFunction;
  default?: unknown;
  auto?: unknown;
  validator?: Validator;
}

export abstract class CoreType {
  protected constructor(public name: string, public options?: CoreTypeOptions) {
    this._checkIntegrity();
  }

  get required(): boolean | BooleanFunction | undefined {
    return this.options?.required;
  }

  get validator(): Validator | undefined {
    return this.options?.validator;
  }

  get auto(): unknown {
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
  validate(value): string[] {
    let errors: string[] = [];
    const typeError = validateType(value, this.typeName, this.name);
    if (typeError !== undefined) {
      errors.push(typeError);
    }
    if (this.validator !== undefined) {
      if (typeof this.validator === 'function') {
        const _valErrors = this.validator(value);
        if (_valErrors !== undefined) {
          errors = [...errors, ..._valErrors];
        }
      } else {
        for (const msg in this.validator) {
          const regExp = this.validator[msg];
          if (regExp.test(value) === false) {
            errors.push(msg);
          }
        }
      }
    }
    errors = [...errors, ...this.applyValidations(value)];

    return errors;
  }

  abstract applyValidations(value): string[];

  abstract typeName: string;

  private _checkIntegrity() {
    if (this.auto !== undefined) {
      if (this.default !== undefined) {
        throw new Error('Property `' + name + '` cannot be both auto and have a default.');
      }

      if (this.auto === 'uuid' && this.typeName !== 'String') {
        throw new Error('Automatic uuid properties must be string typed.');
      }
    }
  }
}

const validateType = (value, type, name) => {
  if (typeof value !== type.toLowerCase()) {
    return `Property ${name} must be type ${type}`;
  }
};
