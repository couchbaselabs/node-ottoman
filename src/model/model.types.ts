import { Model } from './model';

export type WhateverTypes = { [key: string]: any };

export type ModelTypes = WhateverTypes & {
  new <T>(data: T): Model<T> & T;
};
