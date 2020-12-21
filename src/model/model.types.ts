import { Model } from './model';
import { CAST_STRATEGY } from '../utils/cast-strategy';

export type WhateverTypes = { [key: string]: any };

export type ModelTypes = WhateverTypes &
  typeof Model & {
    new <T>(data: T, options: { strategy?: CAST_STRATEGY; strict?: boolean }): Model<T> & T;
  };
