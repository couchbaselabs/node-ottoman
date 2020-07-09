import { Schema } from '../../schema/schema';
import { ConnectionManager } from '../../connections/connection-manager';

export interface ModelOptions {
  collectionName?: string;
  scopeName?: string;
  idKey?: string;
  scopeKey?: string;
  collectionKey?: string;
}

export interface CreateModel {
  name: string;
  schemaDraft: Schema | Record<string, unknown>;
  options: ModelOptions;
  connection: ConnectionManager;
}
