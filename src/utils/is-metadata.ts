/**
 * Checking if key is metadata
 * @param key
 */
export const isMetadataKey = (key: string): boolean => key === 'id' || key === '__collection';
