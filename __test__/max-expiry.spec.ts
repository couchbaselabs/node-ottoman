import { getDefaultInstance, model, Schema, DocumentNotFoundError } from '../src';
import { delay, startInTest } from './testData';

test('Collection with maxExpiry', async () => {
  const schema = new Schema({
    name: String,
  });
  const collectionName = 'maxExpiryCollection';
  const MaxExpiryModel = model<{ name: string }>(collectionName, schema, { maxExpiry: 5 });

  await startInTest(getDefaultInstance());

  const doc = new MaxExpiryModel({ name: 'Max Expiry' });
  await doc.save();

  expect(doc.id).toBeDefined();
  await delay(6000);
  try {
    await MaxExpiryModel.findById(doc.id);
  } catch (e) {
    expect(e).toBeInstanceOf(DocumentNotFoundError);
  }
});

test('Document with maxExpiry, not setted in collection', async () => {
  const schema = new Schema({
    name: String,
  });
  const collectionName = 'maxExpiryDocument';
  const MaxExpiryModel = model<{ name: string }>(collectionName, schema);

  await startInTest(getDefaultInstance());

  const doc = new MaxExpiryModel({ name: 'Max Expiry Document Fixed' });
  await doc.save(false, { maxExpiry: 5 });

  expect(doc.id).toBeDefined();
  await delay(7000);
  try {
    await MaxExpiryModel.findById(doc.id);
  } catch (e) {
    expect(e).toBeInstanceOf(DocumentNotFoundError);
  }
});

/**
 * maxExpiry in Document and Collection only work as expected if Document value is lower than Collection
 * If Collection maxExpiry value is lower than the Document maxExpiry,
 * then the document will be removed by the Collection maxExpiry clean up routine
 **/
test('Collection and Document with maxExpiry', async () => {
  const schema = new Schema({
    name: String,
  });
  const collectionName = 'maxExpiryCollectionAndDocument';
  const MaxExpiryModel = model<{ name: string; id?: string }>(collectionName, schema, { maxExpiry: 15 });

  await startInTest(getDefaultInstance());

  const doc = new MaxExpiryModel({ name: 'Max Expiry' });
  await doc.save(false, { maxExpiry: 5 });
  expect(doc.id).toBeDefined();
  await delay(6000);
  try {
    await MaxExpiryModel.findById(doc.id!);
  } catch (e) {
    expect(e).toBeInstanceOf(DocumentNotFoundError);
  }
});
