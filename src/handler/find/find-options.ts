import { ISelectType, SortType } from '../../query/interface';

export class FindOptions {
  skip?: number;
  limit?: number;
  sort?: Record<string, SortType>;
  populate?: string | string[];
  select?: ISelectType[] | string | string[];
  noId?: boolean;
  noCollection?: boolean;
  constructor(data: FindOptions) {
    for (const key in data) {
      this[key] = data[key];
    }
  }
}

export interface IFindOptions {
  skip?: number;
  limit?: number;
  sort?: Record<string, SortType>;
  populate?: string | string[];
  select?: ISelectType[] | string | string[];
}
