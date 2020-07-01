import { Document } from './document';
import { FindByIdOptions, FindOptions } from '../handler';
import { LogicalWhereExpr, SortType } from '../query';

type CountOptions = { sort?: Record<string, SortType>; limit?: number; skip?: number };

/**
 * Constructor to build a model instance based on a schema and other options
 * Provide methods to handle documents of the current collection in the database
 */

export abstract class Model<T = any> extends Document<T> {
  /**
   * Create a document from this model
   * Implement schema validations, defaults, methods, statics, hooks
   */
  // eslint-disable-next-line no-unused-vars
  constructor(data: any) {
    super();
  }

  // eslint-disable-next-line no-unused-vars
  static async find(filter: LogicalWhereExpr = {}, options: FindOptions = {}): Promise<any> {
    return Promise.resolve({});
  }

  // eslint-disable-next-line no-unused-vars
  static async count(filter: LogicalWhereExpr = {}, options: CountOptions = {}): Promise<any> {
    return Promise.resolve({});
  }

  // eslint-disable-next-line no-unused-vars
  static async findById(id: string, options: FindByIdOptions = {}): Promise<any> {
    return Promise.resolve({});
  }

  // eslint-disable-next-line no-unused-vars
  static async findOne(filter: LogicalWhereExpr = {}, options: { sort?: Record<string, SortType> } = {}): Promise<any> {
    return Promise.resolve({});
  }

  // eslint-disable-next-line no-unused-vars
  static async create(data: Record<string, any>): Promise<any> {
    return Promise.resolve({});
  }

  // eslint-disable-next-line no-unused-vars
  static async update(data: any, id?: string): Promise<any> {
    return Promise.resolve({});
  }

  // eslint-disable-next-line no-unused-vars
  static async replace(data: any, id?: string): Promise<any> {
    return Promise.resolve({});
  }

  // eslint-disable-next-line no-unused-vars
  static async remove(id: string): Promise<any> {
    return Promise.resolve({});
  }

  // eslint-disable-next-line no-unused-vars
  static applyData(data): Model<any> {
    return data;
  }
}
