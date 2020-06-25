/**
 * Stores all indexes
 */

import { buildMapViewIndexFn } from './view/build-map-view-index-fn';

const __indexes: Record<any, { fields: string[]; modelName: string }> = {};
const __viewIndexes: Record<any, { views: any }> = {};
const __refdocIndexes: Record<any, { fields: string[] }[]> = {};

/**
 * Receives an index name and return if it is already registered
 */
export const hasIndex = (indexName: string): boolean => !!__indexes[indexName];

/**
 * Returns all indexes
 */
export const getIndexes = () => __indexes;
export const getViewIndexes = () => __viewIndexes;
export const getRefdocIndexes = () => __refdocIndexes;
export const getRefdocIndexByKey = (key) => __refdocIndexes[key];

/**
 * Registers a new index
 */
export const registerIndex = (indexName: string, fields, modelName) => {
  __indexes[indexName] = { fields, modelName };
};

export const registerViewIndex = (ddocName: string, indexName: string, fields, metadata) => {
  const map = buildMapViewIndexFn(metadata, fields);
  if (!__viewIndexes[ddocName]) {
    __viewIndexes[ddocName] = { views: {} };
  }
  __viewIndexes[ddocName].views[indexName] = { map };
};

export const registerRefdocIndex = (fields: string[], prefix: string) => {
  if (!__refdocIndexes[prefix]) {
    __refdocIndexes[prefix] = [];
  }
  __refdocIndexes[prefix].push({ fields });
};
