export class FindByIdOptions {
  select?: string | string[];
  populate?: string | string[];
  withExpiry?: boolean;
  transcoder?: any;
  timeout?: number;
  constructor(data: FindByIdOptions) {
    for (const key in data) {
      this[key] = data[key];
    }
  }
}
