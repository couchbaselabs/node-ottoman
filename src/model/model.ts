import { Document } from './document';
import { FindByIdOptions, FindOptions } from '../handler';
import { LogicalWhereExpr, SortType } from '../query';

type CountOptions = { sort?: Record<string, SortType>; limit?: number; skip?: number };

/**
 * Constructor to build a model instance based on a schema and other options.
 * Provides methods to handle documents of the current collection in the database
 */
/* istanbul ignore file */
export abstract class Model<T = any> extends Document<T> {
  /**
   * Creates a document from this model.
   * Implements schema validations, defaults, methods, static and hooks
   */
  // eslint-disable-next-line no-unused-vars
  constructor(data: any) {
    super();
  }

  /**
   * Finds documents.
   */
  // eslint-disable-next-line no-unused-vars
  static async find(filter: LogicalWhereExpr = {}, options: FindOptions = {}): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Returns the number of documents that match the query
   */
  // eslint-disable-next-line no-unused-vars
  static async count(filter: LogicalWhereExpr = {}, options: CountOptions = {}): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Allows to retrieve a document by id
   */
  // eslint-disable-next-line no-unused-vars
  static async findById(id: string, options: FindByIdOptions = {}): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Finds a document.
   */
  // eslint-disable-next-line no-unused-vars
  static async findOne(filter: LogicalWhereExpr = {}, options: { sort?: Record<string, SortType> } = {}): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Allows to create a new document
   */
  // eslint-disable-next-line no-unused-vars
  static async create(data: Record<string, any>): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Allows to update a document
   */
  // eslint-disable-next-line no-unused-vars
  static async update(data: any, id?: string): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Allows to replace a document
   */
  // eslint-disable-next-line no-unused-vars
  static async replace(data: any, id?: string): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Allows to remove a document
   */
  // eslint-disable-next-line no-unused-vars
  static async remove(id: string): Promise<any> {
    return Promise.resolve({});
  }

  /**
   * Creates a document from the given data
   * Result will be the same that -> new Model(data)
   */
  // eslint-disable-next-line no-unused-vars
  static fromData(data): Model<any> {
    return data;
  }
}
