import { IModel } from './model';
import { IDocument } from './document';
import { CastOptions } from '../utils/cast-strategy';

type WhateverTypes = { [key: string]: any };

export interface saveOptions {
  maxExpiry?: number;
}

export type ModelTypes<T = any, R = any> = WhateverTypes &
  IModel<T, R> & {
    new (data: T, options?: CastOptions): IDocument<T>;
  };
