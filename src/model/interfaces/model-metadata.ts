import { Schema } from '../../schema/schema';
import { ConnectionManager } from '../../connections/connection-manager';

export interface ModelMetadata {
  modelName: string;
  collectionName: string;
  scopeName: string;
  schema: Schema;
  collection: any;
  ID_KEY: string;
  connection: ConnectionManager;
}
