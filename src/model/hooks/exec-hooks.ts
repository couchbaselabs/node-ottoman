import { pipe } from '../../utils/pipe';
import { EmbedType } from '../../schema';

/**
 * Executes hooks in a chain,
 * passing previous result to the next hook in chain.
 */
export const execHooks = async (schema, hookType: 'preHooks' | 'postHooks', hookAction, document?): Promise<void> => {
  for (const key in schema.fields) {
    const field = schema.fields[key];
    if (field.typeName === 'Embed' && (field as EmbedType).schema) {
      await execHooks((field as EmbedType).schema, hookType, hookAction, document[field.name]);
    }
  }
  if (schema[hookType] && schema[hookType][hookAction]) {
    const hooks = schema[hookType][hookAction];
    const hooksFn = pipe(...hooks);
    await hooksFn(document);
  }
};
