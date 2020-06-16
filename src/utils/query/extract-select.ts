/**
 * Extract the values to be used on select clause.
 */
import { COLLECTION_KEY, DEFAULT_ID_KEY } from '../constants';
import { ISelectType } from '../../query/interface';
import { buildSelectArrayExpr, parseStringSelectExpr } from '../../query';

export const extractSelect = (
  select: string | string[],
  options: { noId?: boolean; noCollection?: boolean } = {},
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
  return [...new Set([...getMetadata(noId, noCollection).map((value) => value.$field), ...selectProjection])];
};

export const getProjectionFields = (
  select: ISelectType[] | string | string[] = '',
  options: { noId?: boolean; noCollection?: boolean } = {},
): { projection: string; fields: string[] } => {
  let fields: string[] = [];
  let projection = '';
  if (typeof select === 'string') {
    projection = select;
    fields = extractSelect(select, { noCollection: options.noCollection, noId: options.noId });
  } else if (Array.isArray(select) && select.length > 0) {
    if (typeof select[0] === 'string') {
      projection = select.toString();
      fields = extractSelect(select as string[], { noCollection: options.noCollection, noId: options.noId });
    } else {
      const selectExpr = buildSelectArrayExpr([
        ...(select as ISelectType[]),
        ...getMetadata(options.noId, options.noCollection),
      ]);
      projection = `${selectExpr}`;
      fields = extractSelect(selectExpr, {
        noCollection: options.noCollection,
        noId: options.noId,
      });
    }
  }

  return {
    projection,
    fields,
  };
};

const getMetadata = (noId?: boolean, noCollection?: boolean) => {
  const metadataSelect: Record<'$field', string>[] = [];
  if (!noCollection) {
    metadataSelect.push({ $field: getCollectionKey() });
  }
  if (!noId) {
    metadataSelect.push({ $field: getMetaId() });
  }
  return metadataSelect;
};

const getMetaId = () => {
  return `META().id as ${DEFAULT_ID_KEY}`;
};

const getCollectionKey = () => {
  return COLLECTION_KEY;
};
