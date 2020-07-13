import { castSchema, ValidationError, BuildSchemaError } from '../src';
import { registerType } from '../src/schema/helpers';
import { Schema, IOttomanType } from '../src/schema';

describe('Schema Types', () => {
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
    class Int8 extends IOttomanType {
      constructor(name: string) {
        super(name, 'Int8');
      }

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
