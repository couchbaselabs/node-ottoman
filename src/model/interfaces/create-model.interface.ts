import { Schema } from '../../schema/schema';
import { ModelMetadata } from './model-metadata.interface';
import { Ottoman } from '../../ottoman/ottoman';

export interface ModelOptions {
  collectionName?: string;
  scopeName?: string;
  idKey?: string;
  modelKey?: string;
  maxExpiry?: string;
  keyGenerator?: (params: { metadata: ModelMetadata; id: any }) => string;
}

export interface CreateModelOptions {
  collectionName: string;
  scopeName: string;
  idKey: string;
  modelKey: string;
  maxExpiry: string;
  keyGenerator?: (params: { metadata: ModelMetadata; id: any }) => string;
}

export interface CreateModel {
  name: string;
  schemaDraft: Schema | Record<string, unknown>;
  options: CreateModelOptions;
  ottoman: Ottoman;
}
