import { hooks } from '../utils/hooks';
import { remove } from '../handler/remove';

/**
 * Remove lifecycle including hooks
 * @ignore
 */
export const removeLifeCicle = ({ id, options, model: { schema, collection } }) => {
  if (schema.pre && schema.pre[hooks.REMOVE]) {
    schema.pre[hooks.REMOVE]();
  }

  const result = remove(id, collection, options);

  if (schema.pre && schema.pre[hooks.REMOVE]) {
    schema.pre[hooks.REMOVE]();
  }

  return result;
};
