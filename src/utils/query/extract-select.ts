/**
 * Extract the values to be used on select clause.
 */
import { buildSelectArrayExpr, parseStringSelectExpr, ISelectType } from '../../query';
import { MODEL_KEY } from '../constants';

export const extractSelect = (
  select: string | string[],
  options: { noCollection?: boolean } = {},
  excludeMeta = false,
  modelKey: string,
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
  const metadata = excludeMeta ? [] : getMetadata(noCollection, modelKey);
  return [...new Set([...selectProjection, ...metadata])];
};

export const getProjectionFields = (
  selectDot: string,
  select: ISelectType[] | string | string[] = '',
  options: { noCollection?: boolean } = {},
  modelKey: string = MODEL_KEY,
): { projection: string; fields: string[] } => {
  let fields: string[] = [];
  let projection = '';
  const metadata = getMetadata(options.noCollection, modelKey);
  if (typeof select === 'string') {
    if (!select) {
      projection = [`\`${selectDot}\`.*`].join(',');
    } else {
      projection = [select, ...metadata].join(',');
    }

    fields = extractSelect(select, { noCollection: options.noCollection }, true, modelKey);
  } else if (Array.isArray(select) && select.length > 0) {
    if (typeof select[0] === 'string') {
      projection = [select, ...metadata].join(',');
      fields = extractSelect(
        select as string[],
        {
          noCollection: options.noCollection,
        },
        true,
        modelKey,
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
        modelKey,
      );
    }
  }

  return {
    projection,
    fields,
  };
};

const getMetadata = (noCollection?: boolean, modelKey?: string) => {
  const metadataSelect: string[] = [];
  if (!noCollection && modelKey) {
    metadataSelect.push(modelKey);
  }
  return metadataSelect;
};
