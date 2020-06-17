import { HOOKS } from '../../utils/hooks';
import { execHooks } from '../hooks/exec-hooks';
import { remove } from '../../handler/remove';
import { updateRefdocIndexes } from './update-refdoc-indexes';

/**
 * Remove lifecycle including hooks
 * @ignore
 */
export const removeLifeCicle = async ({ id, options, metadata, refKeys }) => {
  const { schema, collection } = metadata;
  await execHooks(schema, 'preHooks', HOOKS.REMOVE);

  const result = await remove(id, collection, options);

  // After store document update index refdocs
  refKeys.add = [];
  updateRefdocIndexes(refKeys, null, collection);

  await execHooks(schema, 'preHooks', HOOKS.REMOVE);

  return result;
};
