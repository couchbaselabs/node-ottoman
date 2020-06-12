import { Schema } from '../../schema/schema';
import { ConnectionManager } from '../../connections/connection-mannager';

export interface CreateModel {
  name: string;
  schemaDraft: Schema | Record<string, unknown>;
  options: any;
  connection: ConnectionManager;
}
