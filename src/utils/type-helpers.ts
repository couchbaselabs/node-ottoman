export const isNumber = (val: unknown) => typeof val === 'number' && val === val;
export const isDateValid = (val) => !Number.isNaN(new Date(val).valueOf());
