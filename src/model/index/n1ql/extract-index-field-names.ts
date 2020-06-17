import { jpParse } from '../../../utils/jp-parse';
import { pathToN1QL } from '../../../utils/path-to-n1ql';

export const extractIndexFieldNames = (gsi: { fields: string[] }) => {
  const fieldNames: string[] = [];
  for (let j = 0; j < gsi.fields.length; ++j) {
    const path = jpParse(gsi.fields[j]);
    let wildCardAt = -1;
    for (let k = 0; k < path.length; ++k) {
      if (path[k].operation === 'subscript' && path[k].expression.type === 'wildcard') {
        if (wildCardAt !== -1) {
          throw new Error('Cannot create an index with more than one wildcard in path');
        }
        wildCardAt = k;
      }
    }

    if (wildCardAt === -1) {
      fieldNames.push(pathToN1QL(path));
    } else {
      const pathBefore = path.slice(0, wildCardAt);
      const pathAfter = path.slice(wildCardAt + 1);

      let objTarget = pathToN1QL(pathAfter);
      if (objTarget !== '') {
        objTarget = 'v.' + objTarget;
      } else {
        objTarget = 'v';
      }

      const arrTarget = pathToN1QL(pathBefore);

      fieldNames.push(`DISTINCT ARRAY ${objTarget} FOR v IN ${arrTarget} END`);
    }
  }
  return fieldNames;
};
