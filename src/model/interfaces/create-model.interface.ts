import { Schema } from '../../schema/schema';
import { ConnectionManager } from '../../connections/connection-manager';
import { ModelMetadata } from './model-metadata.interface';

export interface ModelOptions {
  collectionName?: string;
  scopeName?: string;
  idKey?: string;
  scopeKey?: string;
  collectionKey?: string;
  keyGenerator?: (params: { metadata: ModelMetadata; id: any }) => string;
}

export interface CreateModel {
  name: string;
  schemaDraft: Schema | Record<string, unknown>;
  options: ModelOptions;
  connection: ConnectionManager;
}
