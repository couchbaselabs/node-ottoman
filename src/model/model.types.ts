import { IModel } from './model';
import { Document } from './document';
import { CastOptions } from '../utils/cast-strategy';

type WhateverTypes = { [key: string]: any };

export type ModelTypes<T = any, R = any> = WhateverTypes &
  IModel<T, R> & {
    new (data: T, options?: CastOptions): Document<T>;
  };
