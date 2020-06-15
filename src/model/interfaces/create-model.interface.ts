import { Schema } from '../../schema/schema';
import { ConnectionManager } from '../../connections/connection-manager';

export interface CreateModel {
  name: string;
  schemaDraft: Schema | Record<string, unknown>;
  options: any;
  connection: ConnectionManager;
}
