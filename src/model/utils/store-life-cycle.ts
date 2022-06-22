import { HOOKS } from '../../utils/hooks';
import { execHooks } from '../hooks/exec-hooks';
import { ReferenceType, validate } from '../../schema';
import { store } from '../../handler';
import { updateRefdocIndexes } from './update-refdoc-indexes';
import { CAST_STRATEGY } from '../../utils/cast-strategy';
import { DocumentNotFoundError } from 'couchbase';
import { InvalidModelReferenceError } from '../../exceptions/ottoman-errors';

/**
 * Store lifecycle including hooks and validations.
 * @ignore
 */
export const storeLifeCycle = async ({ key, id, data, options, metadata, refKeys }) => {
  const { schema, collection, modelKey, ID_KEY, ottoman } = metadata;
  let document = data;
  const _colleciton = collection();
  await execHooks(schema, 'preHooks', HOOKS.VALIDATE, document);

  document = validate(document, schema, {
    strict: schema.options.strict,
    strategy: CAST_STRATEGY.THROW,
    skip: [modelKey.split('.')[0], ID_KEY],
  });

  // enforceRefCheck logic
  let enforceRefCheck = schema.options.enforceRefCheck;
  if (options.hasOwnProperty('enforceRefCheck')) {
    enforceRefCheck = options.enforceRefCheck;
  }
  if (enforceRefCheck) {
    for (const key in schema.fields) {
      const fieldType = schema.fields[key];
      if (fieldType instanceof ReferenceType) {
        const RefModel = ottoman.getModel(fieldType.refModel);
        try {
          await RefModel.findById(document[fieldType.name]);
        } catch (e) {
          if (e instanceof DocumentNotFoundError) {
            switch (enforceRefCheck) {
              case true:
                console.warn(
                  `Reference to '${fieldType.name}' field with value = '${document[fieldType.name]}' was not found!`,
                );
                break;
              case 'throw':
                throw new InvalidModelReferenceError(
                  `Reference to '${fieldType.name}' field with value = '${document[fieldType.name]}' was not found!`,
                );
            }
          }
        }
      }
    }
  }

  await execHooks(schema, 'postHooks', HOOKS.VALIDATE, document);

  if (options.cas) {
    await execHooks(schema, 'preHooks', HOOKS.UPDATE, document);
  } else {
    await execHooks(schema, 'preHooks', HOOKS.SAVE, document);
  }

  const result = await store(key, document, options, _colleciton);

  // After storing the document update the index refdocs
  await updateRefdocIndexes(refKeys, id, _colleciton);

  if (options.cas) {
    await execHooks(schema, 'postHooks', HOOKS.UPDATE, document);
  } else {
    await execHooks(schema, 'postHooks', HOOKS.SAVE, document);
  }

  return { result, document };
};
