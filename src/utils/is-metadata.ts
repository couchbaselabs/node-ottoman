/**
 * Check if key is metadata.
 * @param key
 */
import { MODEL_KEY, DEFAULT_ID_KEY } from './constants';

export const isMetadataKey = (key: string): boolean => key === DEFAULT_ID_KEY || key === MODEL_KEY;
