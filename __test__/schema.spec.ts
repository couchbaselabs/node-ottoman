import { validateSchema, createSchema, applyDefaultValue } from '../lib';
describe('Schema Types', () => {
  class MocType {}
  test('should throw an error when defining in schema unsupported type.', () => {
    const schema = { name: MocType };
    expect(() => createSchema(schema)).toThrow();
  });

  test('should throw an Error when defining auto value and type is not String', () => {
    const schema = {
      firstName: { type: Date, default: 'John', auto: 'uuid' },
    };
    expect(() => createSchema(schema)).toThrow();
  });

  test('should return true when data is valid', () => {
    const schema = {
      firstName: String,
      lastName: {
        type: String,
        validator: {
          'Only letters': new RegExp('\\w'),
        },
      },
      hasChild: Boolean,
    };
    const data: any = {
      firstName: 'John',
      lastName: 'Doe',
      hasChild: true,
    };
    const result = validateSchema(data, schema);
    expect(result).toBeTruthy();
  });

  test('should throw an error when it does not have value on require property.', () => {
    const personSchema = {
      name: { type: String, required: true },
      hasChild: { type: Boolean, required: true },
    };
    const personData: any = {
      name: '',
    };
    expect(() => validateSchema(personData, personSchema)).toThrow();

    const schemaWithFunction = { name: { type: String, required: () => true } };
    expect(() => validateSchema(personData, schemaWithFunction)).toThrow();
  });

  test('should applied correctly default values', () => {
    const personSchema = {
      firstName: { type: String, default: 'John' },
      lastName: { type: String, default: () => 'Doe' },
      hasChild: { type: Boolean, default: true },
    };

    const obj: any = {};

    applyDefaultValue(obj, personSchema);
    const { firstName, lastName, hasChild } = obj;

    expect(firstName).toBeDefined();
    expect(firstName).toBe('John');

    expect(lastName).toBeDefined();
    expect(lastName).toBe('Doe');

    expect(hasChild).toBeDefined();
    expect(hasChild).toBeTruthy();
  });

  test('should throw an Error when validator fails', () => {
    const validatorJohnName = (v) => {
      const errors: string[] = [];
      if (v !== 'John') {
        errors.push('Only John is allowed');
      }
      return errors;
    };
    const schema = {
      firstName: { type: String, validator: validatorJohnName },
    };
    const data = {
      firstName: 'Peter',
    };
    expect(() => validateSchema(data, schema)).toThrow();

    const schemaWithRegex = {
      firstName: {
        type: String,
        validator: {
          'Only numbers': new RegExp('d'),
        },
      },
    };
    expect(() => validateSchema(data, schemaWithRegex)).toThrow();
  });
});

describe('Schema String Type', () => {
  test('should throw an Error when defining default value and auto value', () => {
    const schema = {
      firstName: { type: String, default: 'John', auto: 'uuid' },
    };
    expect(() => createSchema(schema)).toThrow();
  });

  test('should throw an error when field is an enum string and value is not contained', () => {
    const schema = { color: { type: String, enum: ['Blue', 'Green', 'Yellow'] } };
    const data: any = { color: 'Black' };
    expect(() => validateSchema(data, schema)).toThrow();
  });
  test('should return true when field is an enum string and value is contained', () => {
    const schema = { color: { type: String, enum: ['Blue', 'Green', 'Yellow'] } };
    const data: any = { color: 'Green' };
    const result = validateSchema(data, schema);
    expect(result).toBeTruthy();

    const schemaWithFunction = { color: { type: String, enum: () => ['Blue', 'Green', 'Yellow'] } };
    const resultWithFunction = validateSchema(data, schemaWithFunction);
    expect(resultWithFunction).toBeTruthy();
  });
});
describe('Schema Boolean Type', () => {
  test('should throw an Error when defining default value and auto value', () => {
    const schema = {
      firstName: { type: Boolean, default: true, auto: () => false },
    };
    expect(() => createSchema(schema)).toThrow();
  });
});
