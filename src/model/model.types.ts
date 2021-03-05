import { Model } from './model';
import { CastOptions } from '../utils/cast-strategy';

type WhateverTypes = { [key: string]: any };
type DocumentModelType = { [K in keyof typeof Model]: typeof Model[K] };
type ModelInstanceType = { new <T>(data: T, options?: CastOptions): Model<T> & T };

export type ModelTypes = WhateverTypes & DocumentModelType & ModelInstanceType;
