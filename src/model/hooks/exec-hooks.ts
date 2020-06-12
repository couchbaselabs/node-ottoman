import { pipe } from '../../utils/pipe';

/**
 * Allow to execute hooks in chain,
 * passing previous result value to next hooks.
 */
export const execHooks = async (schema, hookType: 'preHooks' | 'postHooks', hookAction, document?) => {
  if (schema[hookType] && schema[hookType][hookAction]) {
    const hooks = schema[hookType][hookAction];
    const hooksFn = pipe(...hooks);
    await hooksFn(document);
  }
};
