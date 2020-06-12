import { HOOKS } from '../../utils/hooks';
import { execHooks } from '../hooks/exec-hooks';
import { castSchema } from '../../schema/helpers';
import { store } from '../../handler/store';

/**
 * Store lifecycle including hooks and validations
 * @ignore
 */
export const storeLifeCycle = async ({ key, data, options, model: { schema, collection, ID_KEY } }) => {
  let document = data;
  await execHooks(schema, 'preHooks', HOOKS.VALIDATE, document);

  document = castSchema(document, schema);

  await execHooks(schema, 'postHooks', HOOKS.VALIDATE, document);

  await execHooks(schema, 'preHooks', HOOKS.SAVE, document);

  const result = store(key, document, options, collection, ID_KEY);

  await execHooks(schema, 'postHooks', HOOKS.SAVE, document);

  return result;
};
