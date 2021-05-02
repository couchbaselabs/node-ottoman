import { PopulateFieldsType } from '../../model/populate.types';

export const isPopulateAnObject = (fieldsName?: PopulateFieldsType): boolean => {
  return !!fieldsName && typeof fieldsName === 'object' && !Array.isArray(fieldsName);
};
