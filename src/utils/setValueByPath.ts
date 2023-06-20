import _ from 'lodash';

export const setValueByPath = <T = Record<string, any>>(object: T, path: string, value: any) => {
  _.set(object as any, path, value);
};
