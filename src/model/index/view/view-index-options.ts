export class ViewIndexOptions {
  skip?: number;
  limit?: number;
  stale?: unknown;
  order?: unknown;
  reduce?: unknown;
  group?: boolean;
  groupLevel?: number;
  key?: string;
  keys?: string[];
  range?: { start: string | string[]; end: string | string[]; inclusiveEnd: boolean };
  idRange?: string[] | { start: string; end: string };
  fullSet?: boolean;
  onError?: unknown;
  timeout?: number;

  constructor(data: ViewIndexOptions) {
    for (const key in data) {
      this[key] = data[key];
    }
  }
}
