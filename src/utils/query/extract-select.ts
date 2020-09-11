/**
 * Extract the values to be used on select clause.
 */
import { COLLECTION_KEY } from '../constants';
import { buildSelectArrayExpr, parseStringSelectExpr, ISelectType } from '../../query';

export const extractSelect = (
  select: string | string[],
  options: { noCollection?: boolean } = {},
  excludeMeta = false,
): string[] => {
  const { noCollection } = options;
  let selectProjection: string[] = [];

  if (select) {
    if (Array.isArray(select)) {
      selectProjection = select;
    } else {
      selectProjection = parseStringSelectExpr(select);
    }
  }
  const metadata = excludeMeta ? [] : getMetadata(noCollection);
  return [...new Set([...selectProjection, ...metadata])];
};

export const getProjectionFields = (
  collection: string,
  select: ISelectType[] | string | string[] = '',
  options: { noCollection?: boolean } = {},
): { projection: string; fields: string[] } => {
  let fields: string[] = [];
  let projection = '';
  const metadata = getMetadata(options.noCollection);
  if (typeof select === 'string') {
    if (!select) {
      projection = [`\`${collection}\`.*`, ...metadata].join(',');
    } else {
      projection = [select, ...metadata].join(',');
    }

    fields = extractSelect(select, { noCollection: options.noCollection }, true);
  } else if (Array.isArray(select) && select.length > 0) {
    if (typeof select[0] === 'string') {
      projection = [select, ...metadata].join(',');
      fields = extractSelect(
        select as string[],
        {
          noCollection: options.noCollection,
        },
        true,
      );
    } else {
      const selectExpr = buildSelectArrayExpr(select as ISelectType[]);
      projection = [selectExpr, ...metadata].join(',');
      fields = extractSelect(
        selectExpr.replace(/`/g, ''),
        {
          noCollection: options.noCollection,
        },
        true,
      );
    }
  }

  return {
    projection,
    fields,
  };
};

const getMetadata = (noCollection?: boolean) => {
  const metadataSelect: string[] = [];
  if (!noCollection) {
    metadataSelect.push(getCollectionKey());
  }
  return metadataSelect;
};

const getCollectionKey = () => {
  return COLLECTION_KEY;
};
