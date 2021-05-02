import { isObject } from 'util';
import { PopulateSelectBaseType, PopulateSelectType } from '../model/populate.types';
import { Schema } from '../schema';
import { extractPopulate } from './query/extract-populate';

export const extractSchemaReferencesFields = (schema: Schema) => {
  const { fields } = schema;
  const populableFields: any = {};
  for (const fieldName in fields) {
    if (fields.hasOwnProperty(fieldName)) {
      const field = getSchemaType(fieldName, schema);
      if ((field as any).refModel) {
        populableFields[fieldName] = field;
      }
    }
  }
  return populableFields;
};

export const extractSchemaReferencesFromGivenFields = (fields, schema: Schema) => {
  const toPopulate = extractPopulate(fields);
  const fieldsToPopulate: any = {};
  for (const fieldName of toPopulate) {
    fieldsToPopulate[fieldName] = getSchemaType(fieldName, schema);
  }
  return fieldsToPopulate;
};

export const getSchemaType = (fieldName, schema) => {
  let field = schema.path(fieldName);
  if ((field as any).typeName === 'Array') {
    field = (field as any).itemType;
  }
  return field;
};

export const extractPopulateFieldsFromObject = ({ select, populate }: PopulateSelectBaseType): string[] => {
  let toPopulate: string[] = extractPopulate(select);

  if (populate) {
    toPopulate = [
      ...new Set([
        ...toPopulate,
        ...(typeof populate === 'object' && !Array.isArray(populate)
          ? Object.keys(populate)
          : extractPopulate(populate)),
      ]),
    ];
  }
  return toPopulate;
};
