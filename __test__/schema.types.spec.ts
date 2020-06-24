import { applyDefaultValue, castSchema, ValidationError, BuildSchemaError } from '../lib';
import { Schema } from '../lib/schema/schema';
import { isOttomanType } from '../lib/schema/helpers';

describe('Schema Types', () => {
  class MocType {}
  test('should throw an error when defining the unsupported type in schema.', () => {
    const schema = { name: MocType };
    expect(() => new Schema(schema)).toThrow(new BuildSchemaError('Unsupported type specified in the property "name"'));
  });
  test('should throw an error when defining auto value and default value on the same field', () => {
    const schema = {
      firstName: { type: String, default: 'John', auto: 'uuid' },
    };
    expect(() => new Schema(schema)).toThrow(
      new BuildSchemaError('Auto and default values cannot be used at the same time in property firstName.'),
    );
  });
  test('should return an instance of IOttomanType when using a valid path value', () => {
    const schema = new Schema({
      firstName: { type: String },
    });
    const firstName = schema.path('firstName');
    expect(firstName).toBeDefined();
    expect(isOttomanType(firstName)).toBeTruthy();
  });
  test('should return undefined when using a non-existent path value', () => {
    const schema = new Schema({
      firstName: { type: String },
    });
    const firstName = schema.path('lastName');
    expect(firstName).toBeUndefined();
  });
  test('should return the data according to the type defined in the schema when they are valid.', () => {
    const schema = {
      firstName: String,
      lastName: {
        type: String,
        validator: {
          message: 'Only letters',
          regexp: new RegExp('\\w'),
        },
      },
      hasChild: Boolean,
      id: Number,
      age: { type: Number, required: true },
      experience: { type: Number, min: { val: 2, message: 'Min allowed is two' }, max: 4 },
    };
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      hasChild: true,
      age: 23,
      experience: 3,
    };
    expect(castSchema(data, schema)).toEqual(data);

    const dataUnCasted = {
      firstName: 'John',
      lastName: 'Doe',
      hasChild: true,
      age: '23',
      experience: '3',
    };
    expect(castSchema(dataUnCasted, schema)).toEqual(data);

    const dataWithMetadata = {
      firstName: 'John',
      lastName: 'Doe',
      hasChild: true,
      age: 23,
      experience: 3,
      id: 233,
    };
    expect(castSchema(dataWithMetadata, schema)).toEqual(dataWithMetadata);
  });
  test('should apply correctly the default values', () => {
    const personSchema = {
      firstName: { type: String, default: 'John' },
      lastName: { type: String, default: () => 'Doe' },
      hasChild: { type: Boolean, default: true },
    };

    const obj = applyDefaultValue({}, personSchema);
    const { firstName, lastName, hasChild } = obj;

    expect(firstName).toBeDefined();
    expect(firstName).toBe('John');

    expect(lastName).toBeDefined();
    expect(lastName).toBe('Doe');

    expect(hasChild).toBeDefined();
    expect(hasChild).toBeTruthy();
  });
  test('should throw an error when the validator fails', () => {
    const validatorJohnName = (v) => {
      if (v !== 'John') {
        throw new Error('Only John is allowed');
      }
    };

    const schema = {
      firstName: { type: String, validator: validatorJohnName },
    };

    const data = {
      firstName: 'Peter',
    };
    expect(() => castSchema(data, schema)).toThrow('Only John is allowed');

    const schemaWithRegex = {
      firstName: {
        type: String,
        validator: {
          message: 'Only numbers',
          regexp: new RegExp('d'),
        },
      },
    };
    expect(() => castSchema(data, schemaWithRegex)).toThrow(ValidationError);
  });
  test('should return the same schema when it is passed to create', () => {
    const schema = new Schema({ name: String, hasChild: Boolean, age: { type: Number, intVal: true } });
    expect(new Schema(schema)).toStrictEqual(schema);
  });
  test('should throw an exception when the schema has a property without type', () => {
    const schema = {
      name: String,
      hasChild: Boolean,
      age: { type: Number, intVal: true },
      amount: { min: 23, max: 24 },
    };
    expect(() => new Schema(schema)).toThrow(new BuildSchemaError('Property min is a required type'));

    const schemaWithNull = {
      name: String,
      hasChild: Boolean,
      amount: null,
    };
    expect(() => new Schema(schemaWithNull)).toThrow(new BuildSchemaError('Property amount is a required type'));

    const schemaWithUndefined = {
      name: String,
      hasChild: Boolean,
      amount: undefined,
    };
    expect(() => new Schema(schemaWithUndefined)).toThrow(new BuildSchemaError('Property amount is a required type'));
  });
});
