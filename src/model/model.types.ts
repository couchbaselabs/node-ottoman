import { IModel } from './model';

type WhateverTypes = { [key: string]: any };

export type ModelTypes<T = any> = WhateverTypes & IModel<T>;
