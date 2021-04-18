import { DocumentNotFoundError } from 'couchbase';
import { getDefaultInstance, model, Schema } from '../src';
import { delay, startInTest } from './testData';

describe('Test findOneAndUpdate function', () => {
  test('Test find item and update', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);
    await startInTest(getDefaultInstance());
    await Cat.create({ name: 'Figaro', age: 27 });
    await delay(500);
    const response = await Cat.findOneAndUpdate({ name: { $like: '%Figaro%' } }, { name: 'Kitty' });
    expect(response.name).toBe('Figaro');
    const cleanUp = async () => await Cat.removeById(response.id);
    await cleanUp();
  });
  test('Test find item and update with options.new in true', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);
    await startInTest(getDefaultInstance());
    await Cat.create({ name: 'Figaro', age: 27 });
    await delay(500);
    const response = await Cat.findOneAndUpdate({ name: { $like: '%Figaro%' } }, { name: 'Kitty' }, { new: true });
    expect(response.name).toBe('Kitty');
    const cleanUp = async () => await Cat.removeMany({ _type: 'Cat' });
    await cleanUp();
  });
  test('Test find item and update, options.upsert in true', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);
    await startInTest(getDefaultInstance());
    await Cat.create({ name: 'Cat0', age: 27 });
    await delay(500);
    const response = await Cat.findOneAndUpdate({ name: 'Kitty' }, { name: 'Kitty', age: 20 }, { upsert: true });
    expect(response.name).toBe('Kitty');
    const cleanUp = async () => await Cat.removeMany({ _type: 'Cat' });
    await cleanUp();
  });
  test('Test find item and update, Document Not Found', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);
    await startInTest(getDefaultInstance());
    const run = async () => await Cat.findOneAndUpdate({ name: { $like: 'DummyCatName91' } }, { name: 'Kitty' });
    await expect(run).rejects.toThrow(DocumentNotFoundError);
  });
});
