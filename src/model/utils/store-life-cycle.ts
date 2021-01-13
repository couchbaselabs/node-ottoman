import { HOOKS } from '../../utils/hooks';
import { execHooks } from '../hooks/exec-hooks';
import { validate } from '../../schema';
import { store } from '../../handler';
import { updateRefdocIndexes } from './update-refdoc-indexes';
import { CAST_STRATEGY } from '../../utils/cast-strategy';

/**
 * Store lifecycle including hooks and validations
 * @ignore
 */
export const storeLifeCycle = async ({ key, id, data, options, metadata, refKeys }) => {
  const { schema, collection, modelKey, ID_KEY } = metadata;
  let document = data;
  const _colleciton = collection();
  await execHooks(schema, 'preHooks', HOOKS.VALIDATE, document);
  document = validate(document, schema, {
    strict: schema.options.strict,
    strategy: CAST_STRATEGY.THROW,
    skip: [modelKey, ID_KEY],
  });

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
