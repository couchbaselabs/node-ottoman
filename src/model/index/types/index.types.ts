import { FindOptions } from '../../../handler/find/find-options';

export type IndexType = 'refdoc' | 'n1ql' | 'view';
export type SchemaIndex = Record<
  string,
  { by: string | string[]; ref?: string; options?: FindOptions; type?: IndexType }
>;
export type SchemaQuery = Record<string, { by: string; of: string }>;
