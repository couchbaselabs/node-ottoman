import { IModel } from './model';
import { IDocument } from './document';
import { CastOptions } from '../utils/cast-strategy';

type WhateverTypes = { [key: string]: any };

export interface saveOptions {
  maxExpiry?: number;

  /**
   * Default: false
   * enforceRefCheck will check if the referenced document exists
   * set to true: will log a warning message.
   * set to 'throw': will throw an exception.
   */
  enforceRefCheck?: boolean | 'throw';
}

export type ModelTypes<T = any, R = any> = WhateverTypes &
  IModel<T, R> & {
    new (data: T, options?: CastOptions): IDocument<T>;
  };
