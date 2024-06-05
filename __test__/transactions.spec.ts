import { getDefaultInstance, model, Schema, SearchConsistency, TransactionAttemptContext } from '../src';
import { generateUUID } from '../src/utils/generate-uuid';
import { cleanUp } from './testData';
import { QueryScanConsistency } from 'couchbase';

test('transactions ottoman.query', async () => {
  const schema = new Schema({ name: String, age: Number });
  const query =
    'SELECT `name`,`age`,`id`,`_type` FROM `travel-sample`.`_default`.`Duck` WHERE name LIKE "Donald-%" AND _type="Duck"';
  const Duck = model('Duck', schema);
  const ottoman = getDefaultInstance();
  await ottoman.start();
  try {
    await ottoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const name = `Donald-${generateUUID()}`;
      const donald = new Duck({ name, age: 89 });
      await donald.save(false, { transactionContext: ctx });
      const list = await ottoman.query(query, {
        transactionContext: ctx,
      });
      expect(list.rows.length).toBe(1);
    });
  } catch (e) {
    console.log(e);
  }
  const list = await ottoman.query(query, { scanConsistency: QueryScanConsistency.RequestPlus });
  expect(list.rows.length).toBe(1);
  await cleanUp(Duck);
});

test('transactions model.count', async () => {
  const schema = new Schema({ name: String, age: Number });
  const Duck = model('Duck', schema);
  const otttoman = getDefaultInstance();
  await otttoman.start();
  try {
    await otttoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const name = `Daffy-${generateUUID()}`;
      const duffy = new Duck({ name, age: 87 });
      await duffy.save(false, { transactionContext: ctx });
      const donalName = `Donald-${generateUUID()}`;
      const donald = new Duck({ name: donalName, age: 89 });
      await donald.save(false, { transactionContext: ctx });
      const duckCount = await Duck.count({}, { transactionContext: ctx });
      expect(duckCount).toBe(2);
    });
  } catch (e) {
    console.log(e);
  }
  await cleanUp(Duck);
});

test('transactions model.removeById', async () => {
  const schema = new Schema({ name: String, age: Number });
  const Duck = model('Duck', schema);
  const otttoman = getDefaultInstance();
  await otttoman.start();
  try {
    await otttoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const name = `Daffy-${generateUUID()}`;
      const duffy = new Duck({ name, age: 87 });
      await duffy.save(false, { transactionContext: ctx });
      const donalName = `Donald-${generateUUID()}`;
      const donald = new Duck({ name: donalName, age: 89 });
      await donald.save(false, { transactionContext: ctx });
      let duckCount = await Duck.count({}, { transactionContext: ctx });
      expect(duckCount).toBe(2);
      await Duck.removeById(donald.id, { transactionContext: ctx });
      duckCount = await Duck.count({}, { transactionContext: ctx });
      expect(duckCount).toBe(1);
    });
  } catch (e) {
    console.log(e);
  }
  const duckCount = await Duck.count();
  expect(duckCount).toBe(1);
  await cleanUp(Duck);
});

test('transactions document.remove', async () => {
  const schema = new Schema({ name: String, age: Number });
  const Duck = model('Duck', schema);
  const otttoman = getDefaultInstance();
  await otttoman.start();
  try {
    await otttoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const name = `Daffy-${generateUUID()}`;
      const duffy = new Duck({ name, age: 87 });
      await duffy.save(false, { transactionContext: ctx });
      const donalName = `Donald-${generateUUID()}`;
      const donald = new Duck({ name: donalName, age: 89 });
      await donald.save(false, { transactionContext: ctx });
      let duckCount = await Duck.count({}, { transactionContext: ctx });
      expect(duckCount).toBe(2);
      await donald.remove({ transactionContext: ctx });
      duckCount = await Duck.count({}, { transactionContext: ctx });
      expect(duckCount).toBe(1);
    });
  } catch (e) {
    console.log(e);
  }
  const duckCount = await Duck.count();
  expect(duckCount).toBe(1);
  await cleanUp(Duck);
});

test('transactions document.save', async () => {
  const schema = new Schema({ name: String, age: Number });
  const Duck = model('Duck', schema);
  const otttoman = getDefaultInstance();
  await otttoman.start();
  try {
    await otttoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const name = `Daffy-${generateUUID()}`;
      const duffy = new Duck({ name, age: 87 });
      await duffy.save(false, { transactionContext: ctx });
      expect(duffy.id).toBeDefined();
      expect(duffy.name).toBe(name);
    });
  } catch (e) {
    console.log(e);
  }
  await cleanUp(Duck);
});

test('transactions model.replaceById', async () => {
  const schema = new Schema({ name: String, age: Number });
  let docId;
  const newName = `Donald-${generateUUID()}`;
  const Duck = model('Duck', schema);
  const otttoman = getDefaultInstance();
  await otttoman.start();
  try {
    await otttoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const name = `Daffy-${generateUUID()}`;
      const duffy = new Duck({ name, age: 87 });
      await duffy.save(false, { transactionContext: ctx });
      docId = duffy.id;
      expect(docId).toBeDefined();
      expect(duffy.name).toBe(name);
      await Duck.replaceById(docId, { name: newName }, { transactionContext: ctx });
      const modifiedNameDuck = await Duck.findById(docId, { transactionContext: ctx });
      expect(modifiedNameDuck.name).toBe(newName);
    });
  } catch (e) {
    console.log(e);
  }
  const modifiedNameDuck = await Duck.findById(docId);
  expect(modifiedNameDuck.name).toBe(newName);
  await cleanUp(Duck);
});

test('transactions model.updateById', async () => {
  const schema = new Schema({ name: String, age: Number });
  let docId;
  const newName = `Donald-${generateUUID()}`;
  const Duck = model('Duck', schema);
  const otttoman = getDefaultInstance();
  await otttoman.start();
  try {
    await otttoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const name = `Daffy-${generateUUID()}`;
      const duffy = new Duck({ name, age: 87 });
      await duffy.save(false, { transactionContext: ctx });
      docId = duffy.id;
      expect(docId).toBeDefined();
      expect(duffy.name).toBe(name);
      await Duck.updateById(docId, { name: newName }, { transactionContext: ctx });
      const modifiedNameDuck = await Duck.findById(docId, { transactionContext: ctx });
      expect(modifiedNameDuck.name).toBe(newName);
    });
  } catch (e) {
    console.log(e);
  }
  const modifiedNameDuck = await Duck.findById(docId);
  expect(modifiedNameDuck.name).toBe(newName);
  await cleanUp(Duck);
});

test('transactions model.find', async () => {
  const schema = new Schema({ name: String, age: Number });
  const Swan = model('Swan', schema);
  const otttoman = getDefaultInstance();
  await otttoman.start();
  try {
    await otttoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const name = `Odette-${generateUUID()}`;
      const odette = new Swan({ name, age: 30 });
      await odette.save(false, { transactionContext: ctx });
      // check the document was created in the transaction context
      const list = await Swan.find({ name: { $like: 'Odette-%' } }, { transactionContext: ctx });
      expect(list.rows.length).toBe(1);
    });
  } catch (e) {
    console.log(e);
  }
  // check the document was successfully committed
  const list = await Swan.find({ name: { $like: 'Odette-%' } }, { consistency: SearchConsistency.LOCAL });
  expect(list.rows.length).toBe(1);
  await cleanUp(Swan, { name: { $like: 'Odette-%' } });
});

test('transactions model.findOne', async () => {
  const schema = new Schema({ name: String, age: Number });
  const Swan = model('Swan', schema);
  const filter = { name: { $like: 'Odette-%' } };
  const otttoman = getDefaultInstance();
  await otttoman.start();
  try {
    await otttoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const name = `Odette-${generateUUID()}`;
      const odette = new Swan({ name, age: 30 });
      await odette.save(false, { transactionContext: ctx });
      // check the document was created in the transaction context
      const doc = await Swan.findOne(filter, { transactionContext: ctx });
      expect(doc).toBeDefined();
      expect(doc.id).toBe(odette.id);
    });
  } catch (e) {
    console.log(e);
  }
  // check the document was successfully committed
  const doc = await Swan.findOne(filter, { consistency: SearchConsistency.LOCAL });
  expect(doc).toBeDefined();
  expect(doc.id).toBeDefined();
  await cleanUp(Swan, filter);
});

test('transactions model.findOneAndUpdate', async () => {
  const schema = new Schema({ name: String, age: Number });
  const Swan = model('Swan', schema);
  const filter = { name: { $like: 'Odette-%' } };
  const otttoman = getDefaultInstance();
  await otttoman.start();
  try {
    await otttoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const name = `Odette-${generateUUID()}`;
      const odette = new Swan({ name, age: 30 });
      await odette.save(false, { transactionContext: ctx });
      // check the document was created in the transaction context
      const doc = await Swan.findOneAndUpdate(
        filter,
        { name: 'Marie' },
        { consistency: SearchConsistency.LOCAL, transactionContext: ctx, new: true },
      );
      expect(doc).toBeDefined();
      expect(doc.id).toBe(odette.id);
      expect(doc.name).toBe('Marie');
    });
  } catch (e) {
    console.log(e);
  }
  // check the document was successfully committed
  const doc = await Swan.findOne({ name: 'Marie' }, { consistency: SearchConsistency.LOCAL });
  expect(doc).toBeDefined();
  expect(doc.id).toBeDefined();
  await cleanUp(Swan);
});

test('transactions document.populate', async () => {
  const eggSchema = new Schema({ name: String, age: Number });
  const Egg = model('Egg', eggSchema);
  const duckSchema = new Schema({ name: String, age: Number, eggs: [{ type: eggSchema, ref: 'Egg' }] });
  let duckId;
  const Duck = model('Duck', duckSchema);
  const otttoman = getDefaultInstance();
  await otttoman.start();
  try {
    await otttoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const egg = new Egg({ name: 'Harold', age: -21 });
      await egg.save(false, { transactionContext: ctx });
      const duck = new Duck({ name: 'Elizabeth', age: 30, eggs: [egg.id] });
      await duck.save(false, { transactionContext: ctx });
      duckId = duck.id;
      expect(duck.eggs[0]).toBe(egg.id);
      // check the document was created in the transaction context
      await duck._populate('*', { transactionContext: ctx });
      expect(duck.eggs[0].id).toBe(egg.id);
      expect(duck.eggs[0].name).toBe('Harold');

      // check findById populate to fetch ref from context
      const duck2 = await Duck.findById(duck.id, { populate: '*', transactionContext: ctx });
      expect(duck2.eggs[0].id).toBe(egg.id);
      expect(duck2.eggs[0].name).toBe('Harold');

      // check find populate to fetch ref from context
      const ducks = await Duck.find({ id: duck.id }, { populate: '*', transactionContext: ctx });
      expect(ducks.rows[0].eggs[0].id).toBe(egg.id);
      expect(ducks.rows[0].eggs[0].name).toBe('Harold');
    });
  } catch (e) {
    console.log(e);
  }
  const duck = await Duck.findById(duckId);
  expect(duck.eggs[0]).toBeDefined();
  await duck._populate('*');
  expect(duck.eggs[0].name).toBe('Harold');
  await cleanUp(Egg);
  await cleanUp(Duck);
});

test('transactions model.createMany and model.updateMany', async () => {
  const schema = new Schema({ name: String, age: Number });
  const Duck = model('Duck', schema);
  const daisy = `Daisy-${generateUUID()}`;
  const donald = `Donald-${generateUUID()}`;
  const otttoman = getDefaultInstance();
  await otttoman.start();
  try {
    await otttoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const name = `Daffy-${generateUUID()}`;
      await Duck.createMany(
        [
          { name, age: 84 },
          { name: donald, age: 84 },
          { name: daisy, age: 84 },
        ],
        { transactionContext: ctx },
      );
      const duckCount = await Duck.count({}, { transactionContext: ctx });
      expect(duckCount).toBe(3);
      await Duck.updateMany({ age: 84 }, { name: daisy }, { transactionContext: ctx });
      const list = await Duck.find({ age: 84 }, { transactionContext: ctx });
      expect(list.rows.length).toBe(3);
      expect(list.rows).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: donald,
          }),
        ]),
      );
    });
  } catch (e) {
    console.log(e);
  }

  const list = await Duck.find({ age: 84 }, { consistency: SearchConsistency.LOCAL });
  expect(list.rows.length).toBe(3);
  expect(list.rows).not.toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: donald,
      }),
    ]),
  );
  await cleanUp(Duck);
});

test('transactions model.createMany and model.removeMany', async () => {
  const schema = new Schema({ name: String, age: Number });
  const Duck = model('Duck', schema);
  const daisy = `Daisy-${generateUUID()}`;
  const donald = `Donald-${generateUUID()}`;
  const otttoman = getDefaultInstance();
  await otttoman.start();
  try {
    await otttoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const name = `Daffy-${generateUUID()}`;
      await Duck.createMany(
        [
          { name, age: 84 },
          { name: donald, age: 84 },
          { name: daisy, age: 84 },
        ],
        { transactionContext: ctx },
      );
      const duckCount = await Duck.count({ age: 84 }, { transactionContext: ctx });
      expect(duckCount).toBe(3);
      await Duck.removeMany({ age: 84 }, { transactionContext: ctx });
      const duckCountAfterRemove = await Duck.count({ age: 84 }, { transactionContext: ctx });
      expect(duckCountAfterRemove).toBe(0);
    });
  } catch (e) {
    console.log(e);
  }

  const duckCountAfterRemove = await Duck.count({ age: 84 });
  expect(duckCountAfterRemove).toBe(0);
  await cleanUp(Duck);
});

test('transactions rollback', async () => {
  const schema = new Schema({ name: String, age: Number });
  const Swan = model('Swan', schema);
  const otttoman = getDefaultInstance();
  await otttoman.start();
  try {
    await otttoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const name = `Odette-${generateUUID()}`;
      const odette = new Swan({ name, age: 30 });
      await odette.save(false, { transactionContext: ctx });
      // check the document was created in the transaction context
      const list = await Swan.find({}, { transactionContext: ctx });
      expect(list.rows.length).toBe(1);
      await ctx._rollback();
    });
  } catch (e) {
    console.log(e);
  }
  // check the document wasn't committed
  const list = await Swan.find({}, { consistency: SearchConsistency.LOCAL });
  expect(list.rows.length).toBe(0);
});

test('transactions rollback bulk operation', async () => {
  const schema = new Schema({ name: String, age: Number });
  const Duck = model('Duck', schema);
  const otttoman = getDefaultInstance();
  await otttoman.start();
  try {
    await otttoman.$transactions(async (ctx: TransactionAttemptContext) => {
      const name = `Daffy-${generateUUID()}`;
      const daisy = `Daisy-${generateUUID()}`;
      const donald = `Donald-${generateUUID()}`;
      await Duck.createMany(
        [
          { name, age: 84 },
          { name: donald, age: 84 },
          { name: daisy, age: 84 },
        ],
        { transactionContext: ctx },
      );
      const duckCount = await Duck.count({ age: 84 }, { transactionContext: ctx });
      expect(duckCount).toBe(3);
      await ctx._rollback();
    });
  } catch (e) {
    console.log(e);
  }

  const list = await Duck.find({ age: 84 }, { consistency: SearchConsistency.LOCAL });
  expect(list.rows.length).toBe(0);
  await cleanUp(Duck, { age: 84 });
});
