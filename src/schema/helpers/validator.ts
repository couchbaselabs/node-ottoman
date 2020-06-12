export interface ValidatorOption {
  regexp: RegExp;
  message: string;
}

/**
 * Should return string[] with all errors detected
 * Should return ValidatorOption
 */

export type ValidatorFunction = (value: unknown) => string | ValidatorOption;

export const applyValidator = (val: unknown, validator: ValidatorOption | string | undefined): string | void => {
  if (validator !== undefined) {
    const _validator = validator as ValidatorOption;
    if (_validator.regexp !== undefined) {
      if (!_validator.regexp.test(String(val))) {
        return _validator.message;
      }
    } else if (typeof validator === 'string') {
      return String(_validator);
    }
  }
};
