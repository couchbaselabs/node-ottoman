export interface DateOption {
  val: Date;
  message: string;
}
export type DateFunction = () => Date | DateOption;

export const validateMinDate = (value: Date, min: Date | DateOption, property: string): string | void => {
  const _minDate: Date = (min as DateOption).val !== undefined ? (min as DateOption).val : (min as Date);
  if (_minDate > value) {
    return (min as DateOption).message !== undefined
      ? (min as DateOption).message
      : `Property ${property} cannot allow dates before ${_minDate.toISOString()}`;
  }
};

export const validateMaxDate = (value: Date, max: Date | DateOption, property: string): string | void => {
  const _maxDate: Date = (max as DateOption).val !== undefined ? (max as DateOption).val : (max as Date);
  if (_maxDate < value) {
    return (max as DateOption).message !== undefined
      ? (max as DateOption).message
      : `Property ${property} cannot allow dates after ${_maxDate.toISOString()}`;
  }
};
