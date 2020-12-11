import couchbase from 'couchbase';
import { batchProcessQueue, chunkArray, StatusExecution } from '../src/handler';
import { model, Schema } from '../src';
import { ModelMetadata } from '../src/model/interfaces/model-metadata.interface';
import { delay } from './testData';

describe('Test Document Remove Many', () => {
  test('Test Process Query Stack Function', async () => {
    const removeCallback = async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (id.indexOf('9') !== -1) {
        return Promise.resolve(new StatusExecution(id, 'SUCCESS'));
      } else {
        return Promise.reject(new StatusExecution(id, 'FAILED'));
      }
    };
    const stack = Array(205)
      .fill(null)
      .map((u, i) => i.toString());
    // @ts-ignore
    const items = await batchProcessQueue({ collection: null } as ModelMetadata)(stack, removeCallback, 100);
    expect(items.message.modified).toBe(38);
    expect(items.message.errors.length).toBe(167);
  });
  test('Test ChunkArray Function', () => {
    const stack = Array(50)
      .fill(null)
      .map((u, i) => i.toString());
    const result = chunkArray(stack, 10);
    expect(result.length).toBe(5);
  });

  test('Test Remove Many Function', async () => {
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
    const response = await Cat.removeMany({ name: { $like: '%Cat%' } });
    expect(response.message.modified).toBe(4);
    expect(response.message.match_number).toBe(4);
  });

  test('Test Remove Many Function Document Not Found Error', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);

    const run = async () => await Cat.removeMany({ name: { $like: 'DummyCatName91' } });
    await expect(run).rejects.toThrow((couchbase as any).DocumentNotFoundError);
  });
});
