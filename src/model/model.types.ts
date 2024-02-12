import { IModel } from './model';
import { IDocument } from './document';
import { CastOptions } from '../utils/cast-strategy';
import { TransactionAttemptContext } from 'couchbase';

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
  transactionContext?: TransactionAttemptContext;
}

/**
 * Represents the options for counting records.
 */
export interface CountOptions {
  transactionContext?: TransactionAttemptContext;
}

/**
 * Interface for the removeOptions class.
 */
export interface removeOptions {
  transactionContext?: TransactionAttemptContext;
}

export type ModelTypes<T = any, R = any> = WhateverTypes &
  IModel<T, R> & {
    new (data: T, options?: CastOptions): IDocument<T>;
  };
