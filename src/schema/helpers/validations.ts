import { is } from '../../utils/is-type';

export interface RequiredOption {
  val: boolean;
  message: string;
}
export type RequiredFunction = () => boolean | RequiredOption;

type Type = { name: string };

export const validateType = (value: unknown, type: Type | string, name: string): string[] => {
  const result = is(value, type);
  const _type = type as Type;
  return !result ? [`Property ${name} must be type ${_type.name || type}`] : [];
};

export const validateRequire = (required: boolean | RequiredOption | RequiredFunction, name: string): string[] => {
  const _required = (typeof required === 'function' ? required() : required) as RequiredOption;

  if ((typeof _required.val !== 'undefined' && _required.val) || !!_required) {
    return [`Property ${name} is required`];
  }
  return [];
};
