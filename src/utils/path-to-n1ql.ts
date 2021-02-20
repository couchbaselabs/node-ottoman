import { PathN1qlError } from '../exceptions/ottoman-errors';

type PathToN1QLOperationType = 'member' | 'subscript';
type PathToN1QLExpressionType = 'identifier' | 'string_literal';

export type PathToN1QLItemType = {
  operation: PathToN1QLOperationType;
  expression: {
    type: PathToN1QLExpressionType;
    value: string;
  };
};

export const pathToN1QL = (path: PathToN1QLItemType[]): string => {
  const fields: string[] = [];
  for (const { operation, expression } of path) {
    const { type: eType, value: eValue } = expression;
    switch (operation) {
      case 'member': {
        if (eType !== 'identifier') throw new PathN1qlError(`Unexpected member expression type '${eType}'.`);
        break;
      }
      case 'subscript': {
        if (eType !== 'string_literal') throw new PathN1qlError(`Unexpected subscript expression type '${eType}'.`);
        break;
      }
      default:
        throw new PathN1qlError(`Unexpected path operation type '${operation}'.`);
    }
    fields.push(`\`${eValue}\``);
  }
  return fields.join('.');
};
