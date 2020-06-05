export class SelectClauseException extends Error {
  constructor() {
    super('The SELECT clause does not have a proper structure');
  }
}

export class WhereClauseException extends Error {
  constructor() {
    super('The WHERE clause does not have a proper structure');
  }
}
export class MultipleQueryTypesException extends Error {
  constructor(type1: string, type2: string) {
    super(`You can't combine different query types (ex: an ${type1} with an ${type2})`);
  }
}
export class IndexQueryException extends Error {
  constructor() {
    super(`Syntax error in INDEX clause`);
  }
}
export class SelectQueryException extends Error {
  constructor() {
    super(`Syntax error in SELECT clause`);
  }
}

export class QueryOperatorNotFoundException extends Error {
  constructor(operator: string) {
    super(`Operator not found: ${operator}`);
  }
}

export class IndexParamsOnExceptions extends Error {
  constructor(clause: string[]) {
    super(`The ON parameter can only be applied in the following clauses: ${JSON.stringify(clause)}`);
  }
}
