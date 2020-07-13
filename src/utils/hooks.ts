/**
 * Hooks available
 * 'validate' | 'save' | 'update' | 'remove'
 */
export enum HOOKS {
  VALIDATE = 'validate',
  SAVE = 'save',
  UPDATE = 'update',
  REMOVE = 'remove',
}

export type HookTypes = HOOKS | 'validate' | 'save' | 'update' | 'remove';
