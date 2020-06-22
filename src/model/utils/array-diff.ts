// Returns the elements of arr1 that doesn't exist in arr2
export const arrayDiff = (arr1, arr2) => arr1.filter((item) => !arr2.find((ref) => ref === item));
