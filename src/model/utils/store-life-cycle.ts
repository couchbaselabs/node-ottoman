import { HOOKS } from '../../utils/hooks';
import { execHooks } from '../hooks/exec-hooks';
import { castSchema } from '../../schema/helpers';
import { store } from '../../handler';
import { updateRefdocIndexes } from './update-refdoc-indexes';

/**
 * Store lifecycle including hooks and validations
 * @ignore
 */
export const storeLifeCycle = async ({ key, data, options, metadata, refKeys }) => {
  const { schema, collection, ID_KEY } = metadata;
  let document = data;
  await execHooks(schema, 'preHooks', HOOKS.VALIDATE, document);

  document = castSchema(document, schema);

  await execHooks(schema, 'postHooks', HOOKS.VALIDATE, document);

  if (options.cas) {
    await execHooks(schema, 'preHooks', HOOKS.UPDATE, document);
  } else {
    await execHooks(schema, 'preHooks', HOOKS.SAVE, document);
  }

  const result = await store(key, document, options, collection, ID_KEY);

  // After store document update index refdocs
  updateRefdocIndexes(refKeys, key, collection);

  if (options.cas) {
    await execHooks(schema, 'postHooks', HOOKS.UPDATE, { document, result });
  } else {
    await execHooks(schema, 'postHooks', HOOKS.SAVE, { document, result });
  }

  return { result, document };
};
