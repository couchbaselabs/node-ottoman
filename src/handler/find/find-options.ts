export class FindOptions {
  filter?: Record<string, unknown>;
  skip?: number;
  limit?: number;
  sort?: string | string[];
  populate?: string | string[];
  select?: string | string[];

  constructor(data: FindOptions) {
    for (const key in data) {
      this[key] = data[key];
    }
  }
}
