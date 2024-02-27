import { indexFieldsName } from '../helpers/index-field-names';
import { ModelMetadata } from '../../interfaces/model-metadata.interface';
import { TransactionAttemptContext } from 'couchbase';

export const buildViewRefdoc =
  (metadata: ModelMetadata, Model, fields, prefix) =>
  async (values, options: { transactionContext?: TransactionAttemptContext } = {}) => {
    values = Array.isArray(values) ? values : [values];
    const key = buildRefKey(fields, values, prefix);
    const { collection } = metadata;
    const c = collection();
    if (options.transactionContext) {
      const { transactionContext } = options;
      const result = await transactionContext.get(c, key);
      console.log(result);
      if (result?.content) {
        return Model.findById(result.content, { transactionContext: transactionContext });
      }
    } else {
      const result = await c.get(key, options);
      if (result?.value) {
        return Model.findById(result.value);
      }
    }
  };

export const buildFieldsRefKey = (fields: string[], prefix: string): string => {
  const fieldsKey: string = indexFieldsName(fields);
  return `${prefix}$${fieldsKey}`;
};

export const buildRefKey = (fields: string[], values: string[], prefix: string): string => {
  const fieldsRefKey: string = buildFieldsRefKey(fields, prefix);
  const valuesKey: string = values.join('|');
  return `$${fieldsRefKey}.${valuesKey}`;
};
