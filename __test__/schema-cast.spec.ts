import { Schema } from '../src';
import { is } from '../src/utils/is-type';
import { cast, CAST_STRATEGY } from '../src/utils/cast-strategy';
import { ArrayType } from '../src/schema/types';

test('cast schema', () => {
  const childSchema = new Schema({ name: String, age: Number });
  const schema = new Schema({
    name: String,
    age: Number,
    isActive: Boolean,
    createdAt: Date,
    prices: [Number],
    child: childSchema,
    children: [childSchema],
  });

  const john = cast({ age: 23, createdAt: new Date(), prices: [2, 3.14], child: { name: 'jane', age: 3 } }, schema);
  expect(is(john.age, Number)).toBe(true);
  expect(is(john.createdAt, Date)).toBe(true);
  expect(john.prices[0]).toBe(2);
  expect(john.prices[1]).toBe(3.14);
  expect(john.child.age).toBe(3);

  const xavier = cast(
    { age: '32', createdAt: new Date().toISOString(), prices: ['2', '3.14'], child: { name: 'jane', age: '3' } },
    schema,
  );
  expect(is(xavier.age, Number)).toBe(true);
  expect(xavier.age).toBe(32);
  expect(is(xavier.createdAt, Date)).toBe(true);
  expect(xavier.prices[0]).toBe(2);
  expect(xavier.prices[1]).toBe(3.14);
  expect(xavier.child.age).toBe(3);

  const unCasteableData = { age: 'true', createdAt: 'Invalid Date' };
  const drEmpty = cast(unCasteableData, schema);
  expect(drEmpty.age).toBe(undefined);
  expect(drEmpty.createdAt).toBe(undefined);

  const drError = cast(unCasteableData, schema, { strategy: CAST_STRATEGY.KEEP });
  expect(drError.age).toBe(unCasteableData.age);
  expect(drError.createdAt).toBe(unCasteableData.createdAt);
});

test('support array of primitive types', () => {
  const schema = new Schema({
    coordinates: {
      type: [Number],
      required: true,
    },
  });
  const fields = schema.fields;
  expect(fields.coordinates.typeName).toBe(Array.name);
  expect((fields.coordinates as ArrayType).itemType.typeName).toBe(Number.name);
});

test('test strict schema', () => {
  const schema = new Schema({
    name: String,
    age: { type: Number },
  });

  const user = schema.validate({ name: 'testing', age: '45', score: 99 });
  expect(user.age).toBeDefined();
  expect(user.score).toBe(undefined);
});

test('test strict schema using default', () => {
  const schema = new Schema({
    name: String,
    age: { type: Number, default: 15 },
  });

  const user = schema.validate({ name: 'testing', score: 99 }, { strict: true });
  expect(user.age).toBe(15);
  expect(user.score).toBe(undefined);
});
