import { hooks } from '../utils/hooks';
import { validateSchema } from '..';
import { store } from '../handler/store';

/**
 * Store lifecycle including hooks and validations
 * @ignore
 */
export const storeLifeCycle = ({ data, options, model: { schema, collection, ID_KEY } }) => {
  let document = data;
  if (schema.pre && schema.pre[hooks.VALIDATE]) {
    document = schema.pre[hooks.VALIDATE](document);
  }

  validateSchema(document, schema);

  if (schema.post && schema.post[hooks.VALIDATE]) {
    document = schema.post[hooks.VALIDATE](document);
  }

  if (schema.pre && schema.pre[hooks.SAVE]) {
    document = schema.pre[hooks.SAVE](document);
  }

  const result = store(document, options, collection, ID_KEY);

  if (schema.post && schema.post[hooks.SAVE]) {
    schema.post[hooks.SAVE](document);
  }

  return result;
};
