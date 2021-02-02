import couchbase from 'couchbase';

import { getDefaultInstance, getModelMetadata, model, Schema } from '../src';
import { updateCallback } from '../src/handler';
import { delay, startInTest } from './testData';

describe('Test Document Update Many', () => {
  test('Test Update Many Function', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);
    await startInTest(getDefaultInstance());

    const batchCreate = async () => {
      await Cat.create({ name: 'Cat0', age: 27 });
      await Cat.create({ name: 'Cat1', age: 28 });
      await Cat.create({ name: 'Cat2', age: 29 });
      await Cat.create({ name: 'Cat3', age: 30 });
    };
    await batchCreate();
    await delay(500);
    const response = await Cat.updateMany({ name: { $like: '%Cat%' } }, { name: 'Cats' });
    expect(response.message.success).toBe(4);
    expect(response.message.match_number).toBe(4);
    await delay(500);
    const cleanUp = async () => await Cat.removeMany({ _type: 'Cat' });
    await cleanUp();
  });

  test('Test Update Many Function Document Not Found Error', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);
    await startInTest(getDefaultInstance());

    const response = await Cat.updateMany({ name: { $like: 'DummyCatName91' } }, { name: 'Cats' });
    expect(response.message.success).toBe(0);
    expect(response.message.match_number).toBe(0);
    expect(response.message.errors).toEqual([]);
  });
  test('Test Update Many Function Upsert', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);
    await startInTest(getDefaultInstance());

    const response = await Cat.updateMany(
      { name: { $like: 'DummyCatName91' } },
      { name: 'Cats', age: 20 },
      { upsert: true },
    );
    expect(response.message.match_number).toBe(0);
    expect(response.message.success).toBe(1);
    await delay(500);
    const cleanUp = async () => await Cat.removeMany({ _type: 'Cat' });
    await cleanUp();
  });

  test('Update Many Response Errors', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);
    const metadata = getModelMetadata(Cat);
    await Cat.create({ name: 'Cat0', age: 27 });
    await delay(500);
    const doc = await Cat.find({ name: { $like: 'Cat0' } });
    try {
      await updateCallback({ ...doc, id: 'dummy_id' }, metadata, { name: 'Cat' });
    } catch (error) {
      const dnf = new (couchbase as any).DocumentNotFoundError();
      expect(error.exception).toBe(dnf.constructor.name);
      expect(error.message).toBe(dnf.message);
      expect(error.status).toBe('FAILURE');
      const cleanUp = async () => await Cat.removeMany({ _type: 'Cat' });
      await cleanUp();
    }
  });

  test('Test Update Many Model Strict and Model Strategy', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);
    await startInTest(getDefaultInstance());

    await Cat.create({ name: 'Cat0', age: 27 });
    await Cat.create({ name: 'Cat1', age: 28 });
    await delay(500);

    const response = await Cat.updateMany({ name: { $like: '%Cat%' } }, { age: 'Cats' });

    expect(response.status).toBe('FAILURE');
    expect(response.message.errors[0].exception).toBe('ValidationError');

    await delay(500);
    const cleanUp = async () => await Cat.removeMany({ _type: 'Cat' });
    await cleanUp();
  });
});
