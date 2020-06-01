import { is } from '../../utils/is-type';

export interface RequiredOption {
  val: boolean;
  message: string;
}
export type RequiredFunction = () => boolean | RequiredOption;

export const validateType = (value, type, name): string[] =>
  !is(value, type) ? [`Property ${name} must be type ${type}`] : [];

export const validateRequire = (required: boolean | RequiredOption | RequiredFunction, name: string): string[] => {
  const _required = (typeof required === 'function' ? required() : required) as RequiredOption;

  if ((typeof _required.val !== 'undefined' && _required.val) || !!_required) {
    return [`Property ${name} is required`];
  }
  return [];
};
