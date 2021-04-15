import { Schema } from '../../schema';
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
  maxExpiry?: number;
  keyGenerator?: (params: { metadata: ModelMetadata }) => string;
  keyGeneratorDelimiter?: string;
}
