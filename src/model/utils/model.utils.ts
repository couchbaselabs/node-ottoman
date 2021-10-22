import { DocumentNotFoundError } from 'couchbase';
import { InvalidModelReferenceError } from '../../exceptions/ottoman-errors';
import { Ottoman } from '../../ottoman/ottoman';
import { Schema } from '../../schema';
import { CAST_STRATEGY } from '../../utils/cast-strategy';
import { isPopulateAnObject } from '../../utils/populate/is-populate-object';
import {
  extractPopulateFieldsFromObject,
  extractSchemaReferencesFields,
  extractSchemaReferencesFromGivenFields,
} from '../../utils/schema.utils';
import { Document } from '../document';
import { ModelMetadata } from '../interfaces/model-metadata.interface';
import { IModel } from '../model';
import { ModelTypes } from '../model.types';
import { PopulateFieldsType, PopulateOptionsType } from '../populate.types';

export const modelMetadataSymbol = Symbol('modelMetadataSymbol');
export const getModelMetadata = (modelConstructor): ModelMetadata => modelConstructor[modelMetadataSymbol];
export const setModelMetadata = (modelConstructor, metadata: ModelMetadata) =>
  (modelConstructor[modelMetadataSymbol] = metadata);

export type PopulateAuxOptionsType = {
  schema: Schema;
  fieldsName?: PopulateFieldsType;
  pojo: Record<string, unknown> | Document;
  ottoman: Ottoman;
  modelName: string;
} & Partial<PopulateOptionsType>;

export const getPopulated = async (options: PopulateAuxOptionsType): Promise<IModel | Record<string, unknown>> => {
  const {
    deep = 1,
    lean = false,
    schema,
    fieldsName,
    pojo,
    ottoman,
    modelName,
    enforceRefCheck = schema.options.enforceRefCheck,
  } = options;

  let isObject = false;
  let fieldsToPopulate;
  if (!fieldsName || fieldsName === '*') {
    fieldsToPopulate = extractSchemaReferencesFields(schema);
  } else {
    isObject = isPopulateAnObject(fieldsName);
    fieldsToPopulate = extractSchemaReferencesFromGivenFields(
      isObject ? Object.keys(fieldsName ?? '') : fieldsName,
      schema,
    );
  }

  const populateMaxDeep = deep - 1;
  if (populateMaxDeep >= 0)
    for (const field in fieldsToPopulate) {
      const refModel = fieldsToPopulate[field]?.refModel;
      const ref = pojo[field] as string | string[];
      if (refModel && ref) {
        const _SubModel = ottoman.getModel(refModel);
        const current = fieldsName?.[field];
        let select: string | string[] = '';
        if (isObject && current !== '*' && current?.select !== '*') {
          select =
            typeof current === 'string' || Array.isArray(current)
              ? current
              : extractPopulateFieldsFromObject(current) ?? '';
        }

        const populate = populateMaxDeep === 0 ? undefined : current?.populate ?? current ?? '*';
        const params = { select, lean, populateMaxDeep, populate };
        if (Array.isArray(ref)) {
          const promises: Promise<any>[] = [];
          const l = ref.length;
          let i = -1;
          while (++i < l) promises.push(processSubModel(_SubModel, ref[i], params, enforceRefCheck, field));
          const response = await Promise.all(promises);
          i = -1;
          while (++i < l) {
            ref[i] = response[i] || ref[i];
          }
        } else {
          pojo[field] = (await processSubModel(_SubModel, ref, params, enforceRefCheck, field)) || ref;
        }
      }
    }
  if (lean) return pojo;
  const _Model = ottoman.getModel(modelName);
  return new _Model({ ...pojo }, { strict: false, strategy: CAST_STRATEGY.KEEP }).$wasNew();
};

async function processSubModel(model: ModelTypes, ref, options, enforce, field): Promise<any> {
  try {
    return await model.findById(ref, options);
  } catch (e) {
    if (e instanceof DocumentNotFoundError) {
      const msg = `Reference to '${field}' can't be populated cause document with id '${ref}' not found!`;
      switch (enforce) {
        case true:
          console.warn(msg);
          break;
        case 'throw':
          throw new InvalidModelReferenceError(msg);
      }
    }
  }
}
