/**
 * Extract the values to be used on select clause.
 */
import { FindOptions } from '../../handler/find/find-options';
import { COLLECTION_KEY, DEFAULT_ID_KEY } from '../constants';

export const extractSelect = (
  select: FindOptions['select'],
  options: { noId?: boolean; noCollection?: boolean } = {},
): string[] => {
  const { noId, noCollection } = options;
  let selectProjection: string[] = [];

  if (select) {
    if (Array.isArray(select)) {
      selectProjection = select;
    } else if (typeof select === 'string') {
      selectProjection = select.trim().replace(/,/g, ' ').replace(/\s+/g, ' ').split(' ');
    }
  }
  const metadataSelect: string[] = [];
  if (!noCollection) {
    metadataSelect.push(COLLECTION_KEY);
  }
  if (!noId) {
    metadataSelect.push(`META().id as ${DEFAULT_ID_KEY}`);
  }

  return [...new Set([...metadataSelect, ...selectProjection])];
};
