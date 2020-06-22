import { applyDefaultValue, castSchema, ValidationError, BuildSchemaError } from '../lib';
import { registerType } from '../lib/schema/helpers';
import { Schema } from '../lib/schema/schema';
import { IOttomanType } from '../lib/schema/types';
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
