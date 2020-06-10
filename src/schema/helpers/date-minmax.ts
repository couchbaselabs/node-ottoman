export interface DateOption {
  val: Date;
  message: string;
}
export type DateFunction = () => Date | DateOption;

export const validateMinDate = (value: Date, min: Date | DateOption): string[] => {
  const _minDate: Date = (min as DateOption).val !== undefined ? (min as DateOption).val : (min as Date);
  return _minDate > value
    ? [
        (min as DateOption).message !== undefined
          ? (min as DateOption).message
          : `Can't allow dates before ${_minDate.toISOString()}`,
      ]
    : [];
};

export const validateMaxDate = (value: Date, max: Date | DateOption): string[] => {
  const _maxDate: Date = (max as DateOption).val !== undefined ? (max as DateOption).val : (max as Date);
  return _maxDate < value
    ? [
        (max as DateOption).message !== undefined
          ? (max as DateOption).message
          : `Can't allow dates after ${_maxDate.toISOString()}`,
      ]
    : [];
};
