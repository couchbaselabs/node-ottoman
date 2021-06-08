/**
 * Status of Query Response.
 * */
export type Status = 'SUCCESS' | 'FAILURE';

/**
 * Generic class of Query Response
 * */
export class QueryResponse<M> {
  status: Status;
  message: M;
  constructor(status: Status, message: M) {
    this.status = status;
    this.message = message;
  }
}

export interface IStatusExecution {
  payload: string | Record<string, unknown>;
  status: Status;
  exception?: string;
  message?: string;
}

/**
 * Status of a Query Execution.
 * */
export class StatusExecution implements IStatusExecution {
  payload: string | Record<string, unknown>;
  status: Status;
  exception?: string;
  message?: string;
  /**
   * @param payload Receive id when updateMany or removeMany is used, receive object in case of createMany
   * @param status Status of Execution ('SUCCESS' | 'FAILURE')
   * @param exception Couchbase exception
   * @param message Couchbase exception message
   * */
  constructor(payload: string | Record<string, unknown>, status: Status, exception = '', message = '') {
    this.payload = payload;
    this.status = status;
    this.exception = exception;
    this.message = message;
  }
}

/**
 * Message of a Many Query Response.
 *
 * @field match_number Number of items that matched the filter, in case of createMany represent the number of documents to create.
 * @field success Number of successful operations
 * @field errors List of errors thrown in the execution
 * */
export interface ManyResponse<T = any> {
  data?: T[];
  match_number: number;
  success: number;
  errors: StatusExecution[];
}

export interface IManyQueryResponse<T = any> {
  status: Status;
  message: ManyResponse<T>;
}

/**
 * Response class for bulk operations.
 * */
export class ManyQueryResponse<T = any> extends QueryResponse<ManyResponse> implements IManyQueryResponse<T> {
  /**
   * @param status Status of Execution ('SUCCESS' | 'FAILURE')
   * @param message: Message of Response see [ManyResponse](/interfaces/manyresponse.html)
   *
   * The response status will be **SUCCESS** as long as no error occurs, otherwise it will be **FAILURE**.
   * */
  constructor(status: Status, message: ManyResponse<T>) {
    super(status, message);
  }
}
