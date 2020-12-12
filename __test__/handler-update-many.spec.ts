import couchbase from 'couchbase';
import { model, Schema } from '../src';
import { delay } from './testData';

describe('Test Document Update Many', () => {
  test('Test Update Many Function', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);

    const batchCreate = async () => {
      await Cat.create({ name: 'Cat0', age: 27 });
      await Cat.create({ name: 'Cat1', age: 28 });
      await Cat.create({ name: 'Cat2', age: 29 });
      await Cat.create({ name: 'Cat3', age: 30 });
    };
    await batchCreate();
    await delay(500);
    const response = await Cat.updateMany({ name: { $like: '%Cat%' } }, { name: 'Cats' });
    expect(response.message.modified).toBe(4);
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

    const run = async () => await Cat.updateMany({ name: { $like: 'DummyCatName91' } }, { name: 'Cats' });
    await expect(run).rejects.toThrow((couchbase as any).DocumentNotFoundError);
  });
  test('Test Update Many Function Upsert', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);

    const response = await Cat.updateMany(
      { name: { $like: 'DummyCatName91' } },
      { name: 'Cats', age: 20 },
      { upsert: true },
    );
    expect(response.message.match_number).toBe(0);
    expect(response.message.modified).toBe(1);
    await delay(500);
    const cleanUp = async () => await Cat.removeMany({ _type: 'Cat' });
    await cleanUp();
  });
});
