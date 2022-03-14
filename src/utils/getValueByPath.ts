export const getValueByPath = <T = Record<string, any>>(obj: T, path: string, separator = '.') =>
  path.split(separator).reduce((prev, curr) => prev && prev[curr], obj);
