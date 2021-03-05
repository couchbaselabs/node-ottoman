import { applyDefaultValue, BuildSchemaError, IOttomanType, model, Schema, validate, ValidationError } from '../src';
import { isOttomanType } from '../src/schema/helpers';
import { ArrayType, DateType, EmbedType, NumberType, StringType } from '../src/schema/types';
import { delay } from './testData';
import { StringTypeOptions } from '../src/schema/types/string-type';

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
  const schema = new Schema(schemaDef, { strict: true });
  test('should allow to add the preHooks from the schema constructor', () => {
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
  test('should throw an error if the preHooks from the schema constructor is not valid', () => {
    const options = {
      preHooks: {
        validate: 23,
      },
    };
    // @ts-ignore
    let schema = new Schema({ name: String }, options);
    expect(schema).toBeInstanceOf(Schema);
    expect(schema.preHooks).toEqual({});
    const options2 = {
      preHooks: {
        validate: [12],
      },
    };
    // @ts-ignore
    schema = new Schema({ name: String }, options2);
    expect(schema).toBeInstanceOf(Schema);
    expect(schema.preHooks).toEqual({});
  });
  test('should allow to add the postHooks from the schema constructor', () => {
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
    expect(validate(validData, schema)).toEqual(validData);
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
      new BuildSchemaError(`Auto and default values cannot be used at the same time in property 'firstName'.`),
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
    expect(validate(validData, schema)).toEqual(validData);
    expect(validate(dataUnCasted, schema)).toEqual(validData);
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
    expect(() => validate(data, schema)).toThrow('Only John is allowed');

    const schemaWithRegex = {
      firstName: {
        type: String,
        validator: {
          message: 'Only numbers',
          regexp: new RegExp('d'),
        },
      },
    };
    expect(() => validate(data, schemaWithRegex)).toThrow(ValidationError);
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
    expect(() => new Schema(schema)).toThrow(new BuildSchemaError('Unsupported type specified in the property "min"'));

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

  test('date type', () => {
    const dateString = '2020-12-07T14:29:06.062Z';
    const schema = new Schema({
      created: Date,
    });
    const data = validate({ created: dateString }, schema);
    expect(data.created).toBeDefined();
    expect(data.created.toISOString()).toBe(dateString);
    expect(data.created instanceof Date).toBe(true);
  });

  test('String -> should throw a ValidationError', () => {
    const element = new StringType('name', { enum: undefined });
    expect(() => element.validate({}, true)).toThrow(new ValidationError(`Property 'name' must be of type 'String'`));
  });
  test('Number -> should throw a ValidationError', () => {
    const element = new NumberType('number');
    expect(() => element.validate({}, true)).toThrow(new ValidationError(`Property 'number' must be of type 'Number'`));
  });
  test('Date -> should throw a ValidationError', () => {
    const element = new DateType('date');
    expect(() => element.validate({}, false)).toThrow(new ValidationError(`Property 'date' must be of type 'Date'`));
  });
  test('Array -> should throw a ValidationError', () => {
    const element = new ArrayType('array', {} as IOttomanType);
    expect(() => element.validate({}, false)).toThrow(new ValidationError(`Property 'array' must be of type 'Array'`));
  });
  test('Embed -> should throw a ValidationError', () => {
    const schema = new Schema({ name: String });
    const element = new EmbedType('name', schema);
    expect(() => element.validate('name', true)).toThrow(
      new ValidationError(`Property 'name' must be of type 'Embed'`),
    );
  });
});

describe('SchemaTypes -> String', () => {
  const element = new StringType('name');
  test('Option -> Min/Max length should throw ValidationError', async () => {
    element.options = { minLength: 2 };
    expect(() => element.validate('a', true)).toThrow(
      new ValidationError(`Property 'name' is shorter than the minimum allowed length '2'`),
    );
    element.options = { maxLength: 2 };
    expect(() => element.validate('aaa', true)).toThrow(
      new ValidationError(`Property 'name' is longer than the maximum allowed length '2'`),
    );
    element.options = { maxLength: 1, minLength: 3 };
    expect(() => element.validate('', true)).toThrow(
      new ValidationError(`Property 'name' is shorter than the minimum allowed length '3'`),
    );
    element.options = { maxLength: 1, minLength: 3 };
    expect(() => element.validate(11, true)).toThrow(
      new ValidationError(
        `Property 'name' is shorter than the minimum allowed length '3'\nProperty 'name' is longer than the maximum allowed length '1'`,
      ),
    );
  });

  test('Option -> Min/Max length should throw ValidationError maxlengh', async () => {
    const schema = new Schema(
      {
        email: { type: String, lowercase: true, maxLength: 4 },
        code: { type: String, uppercase: true },
      },
      { strict: false },
    );
    const User = model('User', schema);

    try {
      await User.create({
        email: 'Dummy.ExamPle@Email.CoM',
        code: 'asd',
      });
    } catch (e) {
      const { message } = e;
      expect(e).toBeInstanceOf(ValidationError);
      expect(message).toBe(`Property 'email' is longer than the maximum allowed length '4'`);
    }
  });

  test('Option -> Uppercase/Lowercase', async () => {
    element.options = { uppercase: true };
    expect(element.cast('upper')).toBe('UPPER');

    element.options = { lowercase: true };
    expect(element.cast('LOWER')).toBe('lower');

    const schema = new Schema({
      email: { type: String, lowercase: true },
      code: { type: String, uppercase: true },
    });
    const User = model('User', schema);
    const user = await User.create({
      email: 'Dummy.ExamPle@Email.CoM',
      code: 'asd',
    });
    await delay(500);
    await User.removeById(user.id);
    expect(user.email).toBe('dummy.example@email.com');
    expect(user.code).toBe('ASD');

    expect(() => new Schema({ value: { type: String, uppercase: true, lowercase: true } })).toThrow(
      new BuildSchemaError(
        `'lowercase' and 'uppercase' options cannot be used at the same time within property 'value' definition.`,
      ),
    );

    expect(() => new StringType('value', { uppercase: true, lowercase: true })).toThrow(
      new BuildSchemaError(
        `'lowercase' and 'uppercase' options cannot be used at the same time within property 'value' definition.`,
      ),
    );
  });
  test('Option -> Trim', async () => {
    element.options = { trim: true };
    expect(element.cast(' trim trim ')).toBe('trim trim');
  });
});
