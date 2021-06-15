import { getDefaultInstance, model, Schema } from '../src';
import { delay, startInTest } from './testData';

describe('Test Schema Add Function', () => {
  test('Test Schema Add Schema Type Fields', () => {
    const product = new Schema({
      name: { type: String, required: true, auto: 'uuid' },
      isActive: Boolean,
      createdAt: Date,
      prices: [Number],
      meta: {
        votes: { type: Number, min: 0, max: 5 },
        favs: Number,
      },
    });

    const drink = new Schema({
      name: String,
      ounces: Number,
    });

    drink.add(product);
    expect(drink.fields['name']).toHaveProperty('required');
    expect(drink.fields).toHaveProperty('ounces');
    expect(drink.fields['meta']).toHaveProperty('schema');
  });

  test('Test Schema Add Schema Type Index', () => {
    const product = new Schema({
      name: { type: String, required: true, auto: 'uuid' },
    });

    product.index.findName = {
      by: 'name',
      type: 'n1ql',
    };

    const drink = new Schema({
      ounces: Number,
    });

    drink.index.findName = {
      by: 'ounces',
      type: 'n1ql',
    };

    drink.add(product);

    expect(drink.index['findName']).toStrictEqual({
      by: 'name',
      type: 'n1ql',
    });
  });

  test('Test Schema Add Schema Type Methods', () => {
    const product = new Schema({
      name: { type: String, required: true, auto: 'uuid' },
    });

    product.methods.getSchemaName = function () {
      return 'product';
    };

    const drink = new Schema({
      ounces: Number,
    });

    drink.methods.getSchemaName = function () {
      return 'drink';
    };

    drink.add(product);

    expect(drink.methods['getSchemaName']).toStrictEqual(product.methods.getSchemaName);
  });

  test('Test Schema Add Schema Type Statics', () => {
    const product = new Schema({
      name: { type: String, required: true, auto: 'uuid' },
    });

    product.statics.findByName = function (name) {
      return this.find({ name: name });
    };

    const drink = new Schema({
      ounces: Number,
    });

    drink.statics.findByName = function (name) {
      return this.find({ ounces: name });
    };

    drink.add(product);

    expect(drink.statics['findByName']).toStrictEqual(product.statics.findByName);
  });

  test('Test Schema Add Schema Type Queries', () => {
    const product = new Schema({
      name: { type: String, required: true, auto: 'uuid' },
    });

    product.queries = {
      myProducts: {
        of: 'Bar',
        by: 'product',
      },
    };

    const drink = new Schema({
      ounces: Number,
    });

    drink.queries = {
      myProducts: {
        of: 'Bar',
        by: 'drink',
      },
    };

    drink.add(product);

    expect(drink.queries['myProducts']).toStrictEqual({
      of: 'Bar',
      by: 'product',
    });
  });

  test('Test Schema Add Schema Type Hooks', () => {
    const product = new Schema({
      name: { type: String, required: true, auto: 'uuid' },
    });

    product.pre('save', function (document) {
      console.log(document);
    });

    product.pre('save', function (document) {
      console.log(document);
    });

    product.post('save', function (document) {
      console.log(document);
    });

    const drink = new Schema({
      ounces: Number,
    });

    drink.pre('save', function (document) {
      console.log(document);
    });

    drink.post('save', function (document) {
      console.log(document);
    });

    drink.post('validate', function (document) {
      console.log(document);
    });

    drink.add(product);

    expect(drink.preHooks.save.length).toStrictEqual(3);
    expect(drink.postHooks.save.length).toStrictEqual(2);
    expect(drink.postHooks.validate.length).toStrictEqual(1);
  });

  test('Test Schema Add Schema Full Coverage', async () => {
    const product = new Schema({
      name: { type: String, required: true, auto: 'uuid' },
    });
    let hooksCalled = 0;

    product.statics.findByName = function (name) {
      return this.find({ name });
    };

    product.post('save', function () {
      expect(hooksCalled).toEqual(1);
    });

    const drink = new Schema({
      name: String,
      brand: String,
    });

    drink.statics.findByName = function (name) {
      return this.find({ brand: name });
    };

    drink.post('save', function () {
      expect(hooksCalled).toEqual(0);
      hooksCalled++;
    });

    drink.add(product);

    const Drink = model('Drink', drink);
    await startInTest(getDefaultInstance());

    await Drink.create({ name: 'Te', brand: 'TE S.A' });
    await delay(1000);
    const response = await Drink.findByName('Te');

    expect(response.rows).toHaveLength(1);
    const cleanUp = async () => await Drink.removeMany({ _type: 'Drink' });
    await cleanUp();
  });

  test('Test Schema Add Object', () => {
    const product = {
      name: { type: String, required: true, auto: 'uuid' },
      prices: [Number],
      meta: {
        votes: { type: Number, min: 0, max: 5 },
        favs: Number,
      },
    };

    const drink = new Schema({
      name: String,
      ounces: Number,
      meta: String,
    });

    drink.add(product);
    expect(drink.fields['name']).toHaveProperty('required');
    expect(drink.fields).toHaveProperty('ounces');
    expect(drink.fields['meta']).toHaveProperty('schema');
  });
});
