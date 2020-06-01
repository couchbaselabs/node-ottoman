export interface MinmaxOption {
  message: string;
  val: number;
}

export type NumberFunction = () => number | MinmaxOption;

export const validateMinLimit = (val: number, min: number | MinmaxOption | undefined): string | void => {
  if (typeof min === 'number' && min > val) {
    return `${val} is less than ${min}`;
  } else if (typeof min !== 'undefined') {
    const _obj = min as MinmaxOption;
    if (_obj.val > val) {
      return _obj.message;
    }
  }
};

export const validateMaxLimit = (val: number, max: number | MinmaxOption | undefined): string | void => {
  if (typeof max === 'number' && max < val) {
    return `${val} is more than ${max}`;
  } else if (typeof max !== 'undefined') {
    const _obj = max as MinmaxOption;
    if (_obj.val < val) {
      return _obj.message;
    }
  }
};
