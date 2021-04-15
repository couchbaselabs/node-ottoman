export interface MinmaxOption {
  message: string;
  val: number;
}

export type NumberFunction = () => number | MinmaxOption;

export const validateMinLimit = (
  val: number,
  min: number | MinmaxOption | undefined,
  property: string,
): string | void => {
  if (typeof min === 'number' && min > val) {
    return `Property '${property}' is less than the minimum allowed value of '${min}'`;
  }
  if (typeof min !== 'undefined') {
    const _obj = min as MinmaxOption;
    if (_obj.val > val) {
      return _obj.message;
    }
  }
};

export const validateMaxLimit = (
  val: number,
  max: number | MinmaxOption | undefined,
  property: string,
): string | void => {
  if (typeof max === 'number' && max < val) {
    return `Property '${property}' is more than the maximum allowed value of '${max}'`;
  }
  if (typeof max !== 'undefined') {
    const _obj = max as MinmaxOption;
    if (_obj.val < val) {
      return _obj.message;
    }
  }
};
