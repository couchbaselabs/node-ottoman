export type Status = 'SUCCESS' | 'FAILED';

export class QueryResponse<M> {
  status: Status;
  message: M;
  constructor(status: Status, message: M) {
    this.status = status;
    this.message = message;
  }
}

export class StatusExecution {
  id: string;
  status: Status;
  constructor(id: string, status: Status) {
    this.id = id;
    this.status = status;
  }
}

export interface GenericManyResponse {
  errors: string[];
  success: number;
}

export class GenericManyQueryResponse extends QueryResponse<GenericManyResponse> {
  constructor(status: Status, message: GenericManyResponse) {
    super(status, message);
  }
}
