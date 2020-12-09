import { Schema } from '../../schema/schema';
import { Ottoman } from '../../ottoman/ottoman';

export interface ModelMetadata {
  modelName: string;
  collectionName: string;
  scopeName: string;
  schema: Schema;
  collection: any;
  ID_KEY: string;
  ottoman: Ottoman;
  modelKey: string;
  maxExpiry: string;
  keyGenerator?: (params: { metadata: ModelMetadata; id: any }) => string;
}
