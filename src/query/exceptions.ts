export class SelectClauseException extends Error {
  constructor() {
    super('');
    this.name = 'The SELECT clause does not have a proper structure';
  }
}

export class WhereClauseException extends Error {
  constructor() {
    super('');
    this.name = 'The WHERE clause does not have a proper structure';
  }
}
export class MultipleQueryTypesException extends Error {
  constructor(type1: string, type2: string) {
    super(`(ex: an ${type1} with an ${type2}`);
    this.name = `You can't combine different query types`;
  }
}
export class IndexQueryException extends Error {
  constructor() {
    super('');
    this.name = `Syntax error in INDEX clause`;
  }
}
export class SelectQueryException extends Error {
  constructor() {
    super('');
    this.name = `Syntax error in SELECT clause`;
  }
}

export class QueryOperatorNotFoundException extends Error {
  constructor(operator: string) {
    super(operator);
    this.name = `Operator not found`;
  }
}
