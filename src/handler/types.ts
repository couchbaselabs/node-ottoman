/**
 * Status of Query Response
 * */
export type Status = 'SUCCESS' | 'FAILED';

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

/**
 * Status of a Query Execution
 * */
export class StatusExecution {
  id: string;
  status: Status;
  constructor(id: string, status: Status) {
    this.id = id;
    this.status = status;
  }
}

/**
 * Message of a Many Query Response
 * */
export interface GenericManyResponse {
  errors: string[];
  success: number;
}

/**
 * Generic class of Many Query Response
 * */
export class GenericManyQueryResponse extends QueryResponse<GenericManyResponse> {
  constructor(status: Status, message: GenericManyResponse) {
    super(status, message);
  }
}
