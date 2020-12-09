import { Model } from './model';

export type WhateverTypes = { [key: string]: any };

export type ModelTypes = WhateverTypes &
  typeof Model & {
    new <T>(data: T): Model<T> & T;
  };
