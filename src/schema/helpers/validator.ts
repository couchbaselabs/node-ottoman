export interface ValidatorOption {
  regexp: RegExp;
  message: string;
}

/**
 * Should return string[] with all errors detected
 * Should return ValidatorOption
 */

export type ValidatorFunction = (value: unknown) => string | ValidatorOption;

export const applyValidator = (val: unknown, validator: ValidatorOption | string | undefined): string[] => {
  const _errors: string[] = [];
  if (validator !== undefined) {
    const _validator = validator as ValidatorOption;
    if (_validator.regexp !== undefined) {
      if (!_validator.regexp.test(String(val))) {
        _errors.push(_validator.message);
      }
    } else if (typeof validator === 'string') {
      _errors.push(String(_validator));
    }
  }
  return _errors;
};
