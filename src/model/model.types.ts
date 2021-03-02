import { Model } from './model';
import { CAST_STRATEGY } from '../utils/cast-strategy';

export interface ModelTypes extends Function {
  [key: string]: any;
  new <T>(data: T, options?: { strategy?: CAST_STRATEGY; strict?: boolean }): Model<T> & T;
}
