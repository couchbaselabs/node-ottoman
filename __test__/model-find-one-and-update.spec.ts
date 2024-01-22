import { DocumentNotFoundError, getDefaultInstance, model, Schema, SearchConsistency } from '../src';
import { startInTest } from './testData';

describe('Test findOneAndUpdate function', () => {
  test('Test find item and update', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);
    await startInTest(getDefaultInstance());
    await Cat.create({ name: 'Figaro123', age: 27 });
    const response = await Cat.findOneAndUpdate(
      { name: { $like: '%Figaro123%' } },
      { name: 'Kitty' },
      { consistency: SearchConsistency.LOCAL },
    );
    const cleanUp = async () => {
      if (response.id) {
        await Cat.removeById(response.id);
      }
    };
    await cleanUp();
    expect(response.name).toBe('Figaro123');
  });
  test('Test find item and update check stored document', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);
    await startInTest(getDefaultInstance());
    await Cat.create({ name: 'Figaro456', age: 27 });
    const response = await Cat.findOneAndUpdate(
      { name: { $like: '%Figaro456%' } },
      { name: 'Kitty' },
      { consistency: SearchConsistency.LOCAL },
    );
    const doc = await Cat.findById(response.id);
    const cleanUp = async () => await Cat.removeById(response.id);
    await cleanUp();
    expect(response.name).toBe('Figaro456');
    expect(doc.name).toBe('Kitty');
    expect(response.id).toBe(doc.id);
  });
  test('Test find item and update with options.new in true', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);
    await startInTest(getDefaultInstance());
    await Cat.create({ name: 'Figaro789', age: 27 });
    const response = await Cat.findOneAndUpdate(
      { name: { $like: '%Figaro789%' } },
      { name: 'Kitty' },
      { new: true, consistency: SearchConsistency.LOCAL },
    );
    const cleanUp = async () => await Cat.removeMany({ _type: 'Cat' });
    await cleanUp();
    expect(response.name).toBe('Kitty');
  });
  test('Test find item and update, options.upsert in true', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    const Cat = model('Cat', CatSchema);
    await startInTest(getDefaultInstance());
    await Cat.create({ name: 'Cat0', age: 27 });
    const response = await Cat.findOneAndUpdate(
      { name: 'Kitty' },
      { name: 'Kitty', age: 20 },
      { upsert: true, consistency: SearchConsistency.LOCAL },
    );
    const cleanUp = async () => await Cat.removeMany({ _type: 'Cat' });
    await cleanUp();
    expect(response.name).toBe('Kitty');
  });
  test('Test find item and update, Document Not Found', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    interface ICat {
      name: string;
      age: number;
    }
    const Cat = model<ICat>('Cat', CatSchema);
    await startInTest(getDefaultInstance());
    const run = async () =>
      await Cat.findOneAndUpdate(
        { name: { $like: 'DummyCatName91' } },
        { name: 'Kitty' },
        { consistency: SearchConsistency.LOCAL },
      );
    await expect(run).rejects.toThrow(DocumentNotFoundError);
  });

  test('findOneAndRemove', async () => {
    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    interface ICat {
      name: string;
      age: number;
    }
    const Cat = model<ICat>('Cat', CatSchema);
    await startInTest(getDefaultInstance());
    const catName = `FindOneAndRemove-${Date.now()}`;
    await Cat.create({ name: catName });

    const cat = await Cat.findOne({ name: catName }, { consistency: SearchConsistency.LOCAL });
    expect(cat.name).toBe(catName);

    await Cat.findOneAndRemove({ name: catName });

    try {
      await Cat.findOne({ name: catName }, { consistency: SearchConsistency.LOCAL });
    } catch (e) {
      expect(e).toBeInstanceOf(DocumentNotFoundError);
    }
  });
});
