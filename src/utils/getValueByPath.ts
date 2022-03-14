import _ from 'lodash';

export const getValueByPath = <T = Record<string, any>>(obj: T, path: string): any => _.get(obj, path);
