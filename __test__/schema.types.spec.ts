import { applyDefaultValue, castSchema, ValidationError, BuildSchemaError } from '../lib';
import { Schema } from '../lib/schema/schema';
import { isOttomanType } from '../lib/schema/helpers';
import { VALIDATION_STRATEGY } from '../lib/utils';

const validData = {
  firstName: 'John',
  lastName: 'Doe',
  hasChild: true,
  age: 23,
  experience: 3,
};

const dataUnCasted = {
  firstName: 'John',
  lastName: 'Doe',
  hasChild: true,
  age: '23',
  experience: '3',
};

const schemaDef = {
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

describe('Schema Types with Strict Strategy', () => {
  const schemaOptions = {
    validationStrategy: VALIDATION_STRATEGY.STRICT,
  };
  const schema = new Schema(schemaDef, schemaOptions);
  test('should allow add the preHooks since schema constructor', () => {
    const options = {
      preHooks: {
        validate: (document) => console.log(document),
      },
    };
    expect(new Schema({ name: String }, options)).toBeInstanceOf(Schema);
    const options2 = {
      preHooks: {
        validate: [(document) => console.log(document)],
      },
    };
    expect(new Schema({ name: String }, options2)).toBeInstanceOf(Schema);
  });
  test('should throw an error if the preHooks since schema constructor is not valid', () => {
    const options = {
      preHooks: {
        validate: 23,
      },
    };
    let schema = new Schema({ name: String }, options);
    expect(schema).toBeInstanceOf(Schema);
    expect(schema.preHooks).toEqual({});
    const options2 = {
      preHooks: {
        validate: [12],
      },
    };
    schema = new Schema({ name: String }, options2);
    expect(schema).toBeInstanceOf(Schema);
    expect(schema.preHooks).toEqual({});
  });
  test('should allow add the postHooks since schema constructor', () => {
    const options = {
      postHooks: {
        validate: (document) => console.log(document),
      },
    };
    expect(new Schema({ name: String }, options)).toBeInstanceOf(Schema);
    const options2 = {
      postHooks: {
        validate: [(document) => console.log(document)],
      },
    };
    expect(new Schema({ name: String }, options2)).toBeInstanceOf(Schema);
  });
  test('should return the data according to the type defined in the schema when they are valid.', () => {
    expect(castSchema(validData, schema)).toEqual(validData);
  });
  test('should throw an error when data are not exactly type.', () => {
    expect(() => castSchema(dataUnCasted, schema)).toThrow(ValidationError);
  });
});

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
    const schema = new Schema(schemaDef);
    expect(castSchema(validData, schema)).toEqual(validData);
    expect(castSchema(dataUnCasted, schema)).toEqual(validData);
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
