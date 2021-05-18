import { IModel } from './model';
import { Document } from './document';
import { CastOptions } from '../utils/cast-strategy';

type WhateverTypes = { [key: string]: any };

export type ModelTypes<T = any> = WhateverTypes &
  IModel<T> & {
    new (data: T, options?: CastOptions): Document<T>;
  };
