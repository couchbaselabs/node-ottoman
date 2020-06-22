import { applyDefaultValue, castSchema, ValidationError, BuildSchemaError } from '../lib';
import { applyValidator, registerType } from '../lib/schema/helpers';
import { Schema, ModelObject } from '../lib/schema/schema';
import { IOttomanType } from '../lib/schema/types';
import { isOttomanType } from '../lib/schema/helpers';

describe('Schema Helpers', () => {
  test('should return void when the validator is undefined', () => {
    expect(applyValidator('Sample value', undefined)).toBeUndefined();
  });
  test('should return void when using ValidatorOption in the validator and the value is valid', () => {
    expect(applyValidator('Sample value', { message: 'Only letters', regexp: new RegExp('\\w') })).toBeUndefined();
  });
  test("should return a message when using ValidatorOption in the validator and the value isn't valid", () => {
    expect(applyValidator('Sample value', { message: 'Only numbers', regexp: new RegExp('\\d') })).toEqual(
      'Only numbers',
    );
  });
  test('should return a message when receiving a String as result of the validator function', () => {
    const validator = () => 'Value not allowed';
    expect(applyValidator('Sample value', validator())).toEqual('Value not allowed');
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
        return 'Only John is allowed';
      }
    };

    const schema = {
      firstName: { type: String, validator: validatorJohnName },
    };

    const data = {
      firstName: 'Peter',
    };
    expect(() => castSchema(data, schema)).toThrow(ValidationError);

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
  describe('Schema String Type', () => {
    test('should throw an error when defining auto uuid value and it is not a String type ', () => {
      const schema = {
        firstName: { type: Boolean, auto: 'uuid' },
      };
      expect(() => new Schema(schema)).toThrow(new BuildSchemaError('Automatic uuid properties must be string typed.'));
    });

    test('should return a schema instance when auto uuid value is defined and its type is String', () => {
      const schema = {
        firstName: { type: String, auto: 'uuid' },
      };
      expect(new Schema(schema)).toBeDefined();
    });

    test('should throw an error when the field is an enum string and the value is not contained', () => {
      const schema = { color: { type: String, enum: ['Blue', 'Green', 'Yellow'] } };
      const data = { color: 'Black' };
      expect(() => castSchema(data, schema)).toThrow(ValidationError);
    });
    test('should return true when the field is an enum string and the value is contained', () => {
      const schema = { color: { type: String, enum: ['Blue', 'Green', 'Yellow'] } };
      const data = { color: 'Green' };
      expect(castSchema(data, schema)).toEqual(data);

      const schemaWithFunction = { color: { type: String, enum: () => ['Blue', 'Green', 'Yellow'] } };
      expect(castSchema(data, schemaWithFunction)).toEqual(data);
    });
  });
  describe('Schema Boolean Type', () => {
    test('should throw an error when defining default value and auto value', () => {
      const schema = {
        hasFirstName: { type: Boolean, default: true, auto: () => false },
      };
      expect(() => new Schema(schema)).toThrow(BuildSchemaError);
    });
    test('should throw an error when the boolean property is not boolean', () => {
      const schema = {
        names: String,
        hasFirstName: Boolean,
      };
      const data = {
        hasFirstName: {},
        names: 'John Doe',
      };

      expect(() => castSchema(data, schema)).toThrow(
        new ValidationError('Property hasFirstName must be of type Boolean'),
      );
    });
  });
  describe('Schema Number Type', () => {
    test('should throw an error when value is less than min', () => {
      const data = {
        age: 23,
      };
      const schemaWithObject = {
        age: { type: Number, min: { val: 30, message: 'Only 30 or more years allowed' } },
      };
      expect(() => castSchema(data, schemaWithObject)).toThrow(new ValidationError('Only 30 or more years allowed'));

      const validator1 = () => {
        return { val: 30, message: 'Only 30 or more years allowed' };
      };
      const schemaWithFunctionObj = { age: { type: Number, min: validator1 } };
      expect(() => castSchema(data, schemaWithFunctionObj)).toThrow(
        new ValidationError('Only 30 or more years allowed'),
      );

      const validator2 = () => 30;
      const schemaWithFunctionNum = { age: { type: Number, min: validator2 } };
      expect(() => castSchema(data, schemaWithFunctionNum)).toThrow(new ValidationError('23 is less than 30'));
    });
    test('should throw an error when the value is more than max', () => {
      const data = {
        age: 35,
      };
      const schemaWithObject = {
        age: { type: Number, max: { val: 30, message: 'Only 30 or less years allowed' } },
      };
      expect(() => castSchema(data, schemaWithObject)).toThrow(new ValidationError('Only 30 or less years allowed'));

      const validator1 = () => {
        return { val: 30, message: 'Only 30 or less years allowed' };
      };
      const schemaWithFunctionObj = { age: { type: Number, max: validator1 } };
      expect(() => castSchema(data, schemaWithFunctionObj)).toThrow(
        new ValidationError('Only 30 or less years allowed'),
      );

      const validator2 = () => 30;
      const schemaWithFunctionNum = { age: { type: Number, max: validator2 } };
      expect(() => castSchema(data, schemaWithFunctionNum)).toThrow(new ValidationError('35 is more than 30'));
    });
    test('should throw an error when the value is not an integer', () => {
      const data = {
        age: 35.6,
      };
      const schema = {
        age: { type: Number, intVal: true },
      };
      expect(() => castSchema(data, schema)).toThrow(new ValidationError('Property age only allows Integer values'));
    });
    test('should return true when the value is allowed by schema def', () => {
      const dataInteger = {
        age: 35,
      };
      const schemaInteger = {
        age: { type: Number, intVal: true, min: 4, max: 100 },
      };
      expect(castSchema(dataInteger, schemaInteger)).toEqual(dataInteger);

      const dataDecimal = {
        age: 35.45,
      };
      const schemaDecimalWithoutDefIntVal = {
        age: { type: Number, min: 4, max: 100 },
      };
      expect(castSchema(dataDecimal, schemaDecimalWithoutDefIntVal)).toEqual(dataDecimal);

      const schemaDecimalWithDefIntVal = {
        age: { type: Number, intVal: false, min: 4, max: 100 },
      };
      expect(castSchema(dataDecimal, schemaDecimalWithDefIntVal)).toEqual(dataDecimal);
    });
    test('should throw an error when the number property is not number', () => {
      const schema = {
        names: String,
        age: Number,
      };
      const data = {
        age: 'Yes',
        names: 'John Doe',
      };

      expect(() => castSchema(data, schema)).toThrow(new ValidationError('Property age must be of type Number'));
    });
  });
  describe('Schema Date Types', () => {
    describe('Default Value', () => {
      const modelInstance = {
        name: 'John Doe',
        birthday: new Date('2000-01-01'),
      };
      test('should return a valid date after applying default values', () => {
        const schema1: ModelObject = { name: String, birthday: Date, createdAt: { type: Date, default: Date.now } };
        const updateInstance1 = applyDefaultValue(modelInstance, schema1);
        expect(updateInstance1.createdAt).toBeDefined();
        expect(updateInstance1.createdAt).toBeInstanceOf(Date);

        const schema2 = { name: String, birthday: Date, createdAt: { type: Date, default: '2000-01-01' } };
        const updateInstance2 = applyDefaultValue(modelInstance, schema2);
        expect(updateInstance2.createdAt).toBeDefined();
        expect(updateInstance2.createdAt).toBeInstanceOf(Date);

        const schema3 = { name: String, birthday: Date, createdAt: { type: Date, default: () => '2000-01-01' } };
        const updateInstance3 = applyDefaultValue(modelInstance, schema3);
        expect(updateInstance3.createdAt).toBeDefined();
        expect(updateInstance3.createdAt).toBeInstanceOf(Date);

        const schema4 = {
          name: String,
          birthday: Date,
          createdAt: { type: Date, default: () => new Date('2000-01-01') },
        };
        const updateInstance4 = applyDefaultValue(modelInstance, schema4);
        expect(updateInstance4.createdAt).toBeDefined();
        expect(updateInstance4.createdAt).toBeInstanceOf(Date);
      });

      test('should not change the current value after applying default values', () => {
        const schema = { name: String, birthday: { type: Date, default: Date.now } };
        const updateInstance = applyDefaultValue(modelInstance, schema);
        expect(updateInstance.birthday).toBeDefined();
        expect(updateInstance.birthday).toEqual(modelInstance.birthday);
      });
    });

    const validationsFailAssertions = (data, schema1, schema2, schema3, schema4, schema5, opts) => {
      expect(() => castSchema(data, schema1)).toThrow(ValidationError);
      expect(() => castSchema(data, schema2)).toThrow(ValidationError);
      expect(() => castSchema(data, schema3)).toThrow(ValidationError);
      expect(() => castSchema(data, schema4)).toThrow(new ValidationError(opts.message));
      expect(() => castSchema(data, schema5)).toThrow(new ValidationError(opts.message));
    };

    const validationsSuccessAssertions = (data, schema1, schema2, schema3, schema4, schema5) => {
      expect(castSchema(data, schema1)).toEqual(data);
      expect(castSchema(data, schema2)).toEqual(data);
      expect(castSchema(data, schema3)).toEqual(data);
      expect(castSchema(data, schema4)).toEqual(data);
      expect(castSchema(data, schema5)).toEqual(data);
    };

    describe('Min Validation', () => {
      const _minDate = new Date('1999-12-31');
      const schema1 = { name: String, birthday: { type: Date, min: '1999-12-31' } };
      const schema2 = { name: String, birthday: { type: Date, min: _minDate } };
      const schema3 = { name: String, birthday: { type: Date, min: () => _minDate } };
      const opts = { val: _minDate, message: 'Invalid Date' };
      const schema4 = { name: String, birthday: { type: Date, min: opts } };
      const schema5 = { name: String, birthday: { type: Date, min: () => opts } };

      test('should return true when applying min validation with valid data', () => {
        const data = {
          name: 'John Doe',
          birthday: new Date('2000-01-01'),
        };
        validationsSuccessAssertions(data, schema1, schema2, schema3, schema4, schema5);
      });
      test('should throw a validation error when min value date is not set correctly', () => {
        const data = {
          name: 'John Doe',
          birthday: new Date('1990-01-01'),
        };
        validationsFailAssertions(data, schema1, schema2, schema3, schema4, schema5, opts);
      });
    });

    describe('Max Validation', () => {
      const _maxDate = new Date('2000-12-31');
      const schema1 = { name: String, birthday: { type: Date, max: '2000-12-31' } };
      const schema2 = { name: String, birthday: { type: Date, max: _maxDate } };
      const schema3 = { name: String, birthday: { type: Date, max: () => _maxDate } };
      const opts = { val: _maxDate, message: 'Invalid Date' };
      const schema4 = { name: String, birthday: { type: Date, max: opts } };
      const schema5 = { name: String, birthday: { type: Date, max: () => opts } };

      test('should return true when applying max validation with valid data', () => {
        const data = {
          name: 'John Doe',
          birthday: new Date('2000-01-01'),
        };
        validationsSuccessAssertions(data, schema1, schema2, schema3, schema4, schema5);
      });

      test('should throw a validation error when max value date is not correctly set', () => {
        const data = {
          name: 'John Doe',
          birthday: new Date('2001-01-01'),
        };
        validationsFailAssertions(data, schema1, schema2, schema3, schema4, schema5, opts);
      });
    });
    test('should cast to the same object when the date property is empty', () => {
      const schema = {
        birthday: Date,
        name: String,
      };
      const data = {
        name: 'John Doe',
      };

      expect(castSchema(data, schema)).toEqual(data);
    });
    test('should throw an error when the date property is not a date', () => {
      const schema = {
        birthday: Date,
        name: String,
      };
      const data = {
        name: 'John Doe',
        birthday: {},
      };

      expect(() => castSchema(data, schema)).toThrow(new ValidationError('Property birthday must be of type Date'));
    });
  });
  describe('Schema Array Types', () => {
    test('should create successfully an array of the defined type', () => {
      const schemaString = {
        names: [String],
      };
      expect(new Schema(schemaString)).toBeDefined();
      const schemaBoolean = {
        names: [Boolean],
      };
      expect(new Schema(schemaBoolean)).toBeDefined();
    });
    test('should throw an error when the array property first item has not the right type', () => {
      const schema = {
        names: [{ required: true }],
        amount: Number,
      };
      expect(() => new Schema(schema)).toThrow(BuildSchemaError);
    });
    describe('Array Type Validations', () => {
      test('should cast to the same object when all items of the array are valid', () => {
        const schemaString = {
          names: [{ type: String, validator: { regexp: new RegExp('[a-zA-Z\\s]'), message: 'Only letters allowed' } }],
        };
        const data = {
          names: ['John Due', 'Due John'],
        };
        expect(castSchema(data, schemaString)).toEqual(data);
        const schemaNumber = {
          amounts: [{ type: Number, max: { val: 10, message: 'Not a valid value' } }],
        };
        const amountsData = {
          amounts: [2, 3, 4, 10],
        };
        expect(castSchema(amountsData, schemaNumber)).toEqual(amountsData);
      });
      test('should throw an error when an item of the array is invalid', () => {
        const schemaString = {
          names: [{ type: String, validator: { regexp: new RegExp('[a-zA-Z\\s]'), message: 'Only letters allowed' } }],
        };
        const data = {
          names: ['John Due', 'Due John23', '32323'],
        };
        expect(() => castSchema(data, schemaString)).toThrow(new ValidationError('Only letters allowed'));

        const schemaNumber = {
          amounts: [{ type: Number, max: { val: 10, message: 'Not a valid value' } }],
        };
        const amountsData = {
          amounts: [20, 13, 54, 10],
        };
        expect(() => castSchema(amountsData, schemaNumber)).toThrow(new ValidationError('Not a valid value'));
      });
      test('should cast to the same object when array property is empty', () => {
        const schema = {
          names: [String],
          amount: Number,
        };
        const data = {
          amount: 0,
        };

        expect(castSchema(data, schema)).toEqual(data);
      });
      test('should throw an error when the array property is not an array', () => {
        const schema = {
          names: [String],
          amount: Number,
        };
        const data = {
          amount: 0,
          names: {},
        };

        expect(() => castSchema(data, schema)).toThrow(new ValidationError('Property names must be of type Array'));
      });
    });
  });
  describe('Schema Embed Types', () => {
    test('should create a valid schema when using an embedded schema def', () => {
      const schema = {
        address: {
          line: String,
          line2: String,
          postalCode: { type: String, validator: { regexp: new RegExp('\\d'), message: 'Invalid postal code' } },
        },
      };
      const result = new Schema(schema);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Schema);
    });

    test('should create a valid schema when using an embedded schema instance', () => {
      const addressSchema = new Schema({
        line: String,
        line2: String,
        postalCode: { type: String, validator: { regexp: new RegExp('\\d'), message: 'Invalid postal code' } },
      });

      const schema = {
        address: addressSchema,
      };
      const result = new Schema(schema);
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Schema);
    });

    test('should cast to the same object when the embedded property is empty', () => {
      const schema = {
        birthday: Date,
        names: {
          firstName: String,
          lastName: String,
        },
      };
      const data = {
        birthday: Date.now(),
      };

      expect(castSchema(data, schema)).toEqual(data);
    });
    test('should throw an error when the embedded property is not embedded', () => {
      const schema = {
        birthday: Date,
        names: {
          firstName: String,
          lastName: String,
        },
      };
      const data = {
        names: 'John Doe',
        birthday: Date.now(),
      };
      expect(() => castSchema(data, schema)).toThrow(new ValidationError('Property names must be of type Embed'));
    });
  });
  describe('Schema Model Ref Types', () => {
    test('should create a schema when using a ref to another schema', () => {
      const userSchema = new Schema({ name: String });
      const schema = new Schema({ user: { type: userSchema, ref: 'User' } });
      expect(schema).toBeDefined();
      expect(schema).toBeInstanceOf(Schema);
    });
    test('should create a schema when referenced from other model', () => {
      const UserSchema = new Schema({ name: String });
      const schema = new Schema({ user: { type: UserSchema, ref: 'User' } });
      expect(schema).toBeDefined();
      expect(schema).toBeInstanceOf(Schema);
    });
    test('should return true when validating schema with another model', () => {
      const UserSchema = new Schema({ name: String });
      const schema = new Schema({ user: { type: UserSchema, ref: 'User' } });
      const data = {
        user: { name: 'John Doe' },
      };
      expect(castSchema(data, schema)).toEqual(data);
    });
    test('should throw an error validation when validating schema with another model', () => {
      const UserSchema = new Schema({ name: String });
      const schema = new Schema({ user: { type: UserSchema, ref: 'User' } });
      const data = {
        user: { name: { age: 35 } },
      };
      expect(() => castSchema(data, schema)).toThrow(new ValidationError('Property name must be of type String'));
    });
    test('should create a schema with an array of references', () => {
      const commentSchema = new Schema({
        title: String,
        description: String,
        published: Boolean,
      });
      const postSchemaDef = {
        postTitle: String,
        comments: [{ type: commentSchema, ref: 'Comment' }],
      };

      expect(new Schema(postSchemaDef)).toBeInstanceOf(Schema);
    });
    test('should return true when validating the schema with the array of references', () => {
      const commentSchema = new Schema({
        title: String,
        description: String,
        published: Boolean,
      });
      const postSchemaDef = new Schema({
        postTitle: String,
        comments: [{ type: commentSchema, ref: 'Comment' }],
      });
      const data = {
        postTitle: 'Test',
        comments: [
          {
            title: 'I Like',
            description: 'I like',
            published: true,
          },
          '2132131323',
        ],
      };
      expect(castSchema(data, postSchemaDef)).toEqual(data);
    });
    test('should throw an error when validated with schema and a bad array of references', () => {
      const commentSchema = new Schema({
        title: String,
        description: String,
        published: Boolean,
      });
      const postSchemaDef = new Schema({
        postTitle: String,
        comments: [{ type: commentSchema, ref: 'Comment' }],
      });
      const data = {
        postTitle: 'Test',
        comments: [
          {
            title: { age: 34 },
            description: 'I like',
            published: true,
          },
          '22132131323',
        ],
      };
      expect(() => castSchema(data, postSchemaDef)).toThrow(ValidationError);
    });
    test('should throw an error when the ref property is not ref', () => {
      const UserSchema = new Schema({ name: String });
      const schema = new Schema({ user: { type: UserSchema, ref: 'User' } });
      const data = {
        user: 34,
      };
      expect(() => castSchema(data, schema)).toThrow(new ValidationError('Property user must be of type Reference'));
    });
  });
  describe('Schema Add Custom Types', () => {
    class Int8 implements IOttomanType {
      constructor(public name: string) {}
      typeName = 'Int8';

      cast(): unknown {
        return undefined;
      }
    }
    registerType(Int8.name, (fieldName) => new Int8(fieldName));
    test('should create a valid schema when using custom type', () => {
      const def = { age: Int8 };
      const a = new Schema(def);
      expect(a).toBeInstanceOf(Schema);
      expect(a.path('age')).toBeInstanceOf(Int8);
    });

    test('should throw an error when trying to register a custom type already registered', () => {
      expect.assertions(1);
      try {
        registerType(Int8.name, (fieldName) => new Int8(fieldName));
      } catch (e) {
        expect(e).toEqual(new Error('A type with this name has already been registered'));
      }
    });
  });
  describe('Schema Combine Some Types', () => {
    const CardSchema = new Schema({
      number: String,
      zipCode: String,
    });

    const CatSchema = new Schema({
      name: String,
      age: Number,
    });
    test('should return a valid object when some non-required schema properties are missing', () => {
      const UserSchema = new Schema({
        type: String,
        isActive: Boolean,
        name: String,
        settings: {
          ttl: { type: Number },
          email: String,
        },
        card: { type: CardSchema, ref: 'Card' },
        cat: { type: CatSchema, ref: 'Cat' },
      });

      const data = {
        name: 'george',
        settings: {
          email: 'george@gmail.com',
        },
      };

      expect(castSchema(data, UserSchema)).toEqual(data);
    });

    test('should throw an error when some required schema properties are missing', () => {
      const UserSchema = new Schema({
        type: { type: String, required: true },
        isActive: Boolean,
        name: String,
        settings: {
          ttl: { type: Number },
          email: String,
        },
        card: { type: CardSchema, ref: 'Card' },
        cat: { type: CatSchema, ref: 'Cat' },
      });

      const data = {
        name: 'george',
        settings: {
          email: 'george@gmail.com',
        },
      };

      expect(() => castSchema(data, UserSchema)).toThrow(ValidationError);

      const UserSchema2 = new Schema({
        type: { type: String, required: { val: true, message: 'Required!' } },
        isActive: Boolean,
        name: String,
        settings: {
          ttl: { type: Number },
          email: String,
        },
        card: { type: CardSchema, ref: 'Card' },
        cat: { type: CatSchema, ref: 'Cat' },
      });
      expect(() => castSchema(data, UserSchema2)).toThrow(new ValidationError('Required!'));
    });
  });
});
describe('Schema', () => {
  const schema = new Schema({ name: String });
  describe('Pre-Hooks', () => {
    test('should add pre-hooks to action validate', () => {
      schema.pre('validate', () => console.log('Yes'));
      expect(schema.preHooks.validate).toBeDefined();
      expect(schema.preHooks.validate).toBeInstanceOf(Array);
      expect(schema.preHooks.validate[0]).toBeInstanceOf(Function);
    });
    test('should add pre-hooks to action save', () => {
      schema.pre('save', () => console.log('Yes'));
      expect(schema.preHooks.save).toBeDefined();
      expect(schema.preHooks.save).toBeInstanceOf(Array);
      expect(schema.preHooks.save[0]).toBeInstanceOf(Function);
    });
    test('should add pre-hooks to action remove', () => {
      schema.pre('remove', () => console.log('Yes'));
      expect(schema.preHooks.remove).toBeDefined();
      expect(schema.preHooks.remove).toBeInstanceOf(Array);
      expect(schema.preHooks.remove[0]).toBeInstanceOf(Function);
    });
    test('should throw an error when adding the pre-hook to an action not allowed', () => {
      expect(() => schema.pre('other', () => console.log('Yes'))).toThrow(BuildSchemaError);
    });
  });

  describe('Post-Hooks', () => {
    test('should add post-hooks to action validate', () => {
      schema.post('validate', () => console.log('Yes'));
      expect(schema.postHooks.validate).toBeDefined();
      expect(schema.postHooks.validate).toBeInstanceOf(Array);
      expect(schema.postHooks.validate[0]).toBeInstanceOf(Function);
    });
    test('should add post-hooks to action save', () => {
      schema.post('save', () => console.log('Yes'));
      expect(schema.postHooks.save).toBeDefined();
      expect(schema.postHooks.save).toBeInstanceOf(Array);
      expect(schema.postHooks.save[0]).toBeInstanceOf(Function);
    });
    test('should add post-hooks to action remove', () => {
      schema.post('remove', () => console.log('Yes'));
      expect(schema.postHooks.remove).toBeDefined();
      expect(schema.postHooks.remove).toBeInstanceOf(Array);
      expect(schema.postHooks.remove[0]).toBeInstanceOf(Function);
    });
    test('should throw an error when adding the post-hook to an action not allowed', () => {
      expect(() => schema.post('other', () => console.log('Yes'))).toThrow(BuildSchemaError);
    });
  });
  describe('Plugins', () => {
    test('should apply a plugin', () => {
      const fnPlugin = (s) => expect(s).toEqual(schema);
      schema.plugin(fnPlugin);
    });
  });
});
