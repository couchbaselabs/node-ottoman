import { HOOKS } from '../../utils/hooks';
import { execHooks } from '../hooks/exec-hooks';
import { remove } from '../../handler/remove';

/**
 * Remove lifecycle including hooks
 * @ignore
 */
export const removeLifeCycle = async ({ id, options, model: { schema, collection } }) => {
  await execHooks(schema, 'preHooks', HOOKS.REMOVE);

  const result = await remove(id, collection, options);

  await execHooks(schema, 'preHooks', HOOKS.REMOVE);

  return result;
};
