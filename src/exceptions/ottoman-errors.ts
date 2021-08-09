export class OttomanError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PathN1qlError extends OttomanError {}
export class BuildSchemaError extends OttomanError {}
export class ImmutableError extends OttomanError {}
export class BuildIndexQueryError extends OttomanError {}
export class BuildQueryError extends OttomanError {}
export class BadKeyGeneratorDelimiterError extends OttomanError {
  name = 'BadKeyGeneratorDelimiter';
}
