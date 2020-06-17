/**
 * Extract the values to be used on select clause.
 */
import { COLLECTION_KEY, DEFAULT_ID_KEY } from '../constants';
import { ISelectType } from '../../query/interface';
import { buildSelectArrayExpr, parseStringSelectExpr } from '../../query';

export const extractSelect = (
  select: string | string[],
  options: { noId?: boolean; noCollection?: boolean } = {},
  excludeMeta = false,
): string[] => {
  const { noId, noCollection } = options;
  let selectProjection: string[] = [];

  if (select) {
    if (Array.isArray(select)) {
      selectProjection = select;
    } else {
      selectProjection = parseStringSelectExpr(select);
    }
  }
  const metadata = excludeMeta ? [] : getMetadata(noId, noCollection);
  return [...new Set([...selectProjection, ...metadata])];
};

export const getProjectionFields = (
  collection: string,
  select: ISelectType[] | string | string[] = '',
  options: { noId?: boolean; noCollection?: boolean } = {},
): { projection: string; fields: string[] } => {
  let fields: string[] = [];
  let projection = '';
  const metadata = getMetadata(options.noId, options.noCollection);
  if (typeof select === 'string') {
    if (!select) {
      projection = [`\`${collection}\`.*`, ...metadata].join(',');
    } else {
      projection = [select, ...metadata].join(',');
    }

    fields = extractSelect(select, { noCollection: options.noCollection, noId: options.noId }, true);
  } else if (Array.isArray(select) && select.length > 0) {
    if (typeof select[0] === 'string') {
      projection = [select, ...metadata].join(',');
      fields = extractSelect(
        select as string[],
        {
          noCollection: options.noCollection,
          noId: options.noId,
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
          noId: options.noId,
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

const getMetadata = (noId?: boolean, noCollection?: boolean) => {
  const metadataSelect: string[] = [];
  if (!noCollection) {
    metadataSelect.push(getCollectionKey());
  }
  if (!noId) {
    metadataSelect.push(getMetaId());
  }
  return metadataSelect;
};

const getMetaId = () => {
  return `META().id as ${DEFAULT_ID_KEY}`;
};

const getCollectionKey = () => {
  return COLLECTION_KEY;
};
