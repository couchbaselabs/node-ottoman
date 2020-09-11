import { ISelectType, SortType } from '../../query';

export class FindOptions {
  skip?: number;
  limit?: number;
  sort?: Record<string, SortType>;
  populate?: string | string[];
  populateMaxDeep?: number;
  select?: ISelectType[] | string | string[];
  consistency?: 0 | 1 | 2;
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
