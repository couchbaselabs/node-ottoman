export const isOttomanType = (object): boolean => 'name' in object && 'typeName' in object && 'cast' in object;
