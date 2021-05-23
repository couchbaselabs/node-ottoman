import { pipe } from '../../utils/pipe';

/**
 * Executes hooks in a chain,
 * passing previous result to the next hook in chain.
 */
export const execHooks = async (schema, hookType: 'preHooks' | 'postHooks', hookAction, document?) => {
  if (schema[hookType] && schema[hookType][hookAction]) {
    const hooks = schema[hookType][hookAction];
    const hooksFn = pipe(...hooks);
    await hooksFn(document);
  }
};
