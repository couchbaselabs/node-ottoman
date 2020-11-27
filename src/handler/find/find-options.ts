import { ISelectType, SortType } from '../../query';
import { SearchConsistency } from '../../utils/search-conscistency';

export class FindOptions {
  skip?: number;
  limit?: number;
  sort?: Record<string, SortType>;
  populate?: string | string[];
  populateMaxDeep?: number;
  select?: ISelectType[] | string | string[];
  consistency?: SearchConsistency;
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
  populateMaxDeep?: number;
  select?: ISelectType[] | string | string[];
  consistency?: SearchConsistency;
  noCollection?: boolean;
}
