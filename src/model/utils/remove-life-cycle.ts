import { HOOKS } from '../../utils/hooks';
import { execHooks } from '../hooks/exec-hooks';
import { remove } from '../../handler';
import { updateRefdocIndexes } from './update-refdoc-indexes';

/**
 * Remove lifecycle including hooks
 * @ignore
 */
export const removeLifeCycle = async ({ id, options, metadata, refKeys, data }) => {
  const { schema, collection } = metadata;
  const document = data;
  await execHooks(schema, 'preHooks', HOOKS.REMOVE, document);

  const result = await remove(id, collection, options);

  // After store document update index refdocs
  refKeys.add = [];
  updateRefdocIndexes(refKeys, null, collection);

  await execHooks(schema, 'preHooks', HOOKS.REMOVE, { document, result });

  return { result, document };
};
