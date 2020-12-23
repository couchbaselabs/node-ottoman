import { validate, ValidationError, BuildSchemaError, Schema, IOttomanType, registerType } from '../src';
import { MixedType } from '../src/schema/types';

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
        expect(validate(data, schemaString)).toEqual(data);
        const schemaNumber = {
          amounts: [{ type: Number, max: { val: 10, message: 'Not a valid value' } }],
        };
        const amountsData = {
          amounts: [2, 3, 4, 10],
        };
        expect(validate(amountsData, schemaNumber)).toEqual(amountsData);
      });
      test('should throw an error when an item of the array is invalid', () => {
        const schemaString = {
          names: [{ type: String, validator: { regexp: new RegExp('[a-zA-Z\\s]'), message: 'Only letters allowed' } }],
        };
        const data = {
          names: ['John Due', 'Due John23', '32323'],
        };
        expect(() => validate(data, schemaString)).toThrow(new ValidationError('Only letters allowed'));

        const schemaNumber = {
          amounts: [{ type: Number, max: { val: 10, message: 'Not a valid value' } }],
        };
        const amountsData = {
          amounts: [20, 13, 54, 10],
        };
        expect(() => validate(amountsData, schemaNumber)).toThrow(new ValidationError('Not a valid value'));
      });
      test('should cast to the same object when array property is empty', () => {
        const schema = {
          names: [String],
          amount: Number,
        };
        const data = {
          amount: 0,
        };

        expect(validate(data, schema)).toEqual(data);
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

        expect(() => validate(data, schema)).toThrow(new ValidationError('Property names must be of type Array'));
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
      expect(validate(data, schema)).toEqual({ birthday: new Date(data.birthday) });
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
      expect(() => validate(data, schema)).toThrow(new ValidationError('Property names must be of type Embed'));
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
      expect(validate(data, schema)).toEqual(data);
    });
    test('should throw an error validation when validating schema with another model', () => {
      const UserSchema = new Schema({ name: String });
      const schema = new Schema({ user: { type: UserSchema, ref: 'User' } });
      const data = {
        user: { name: { age: 35 } },
      };
      expect(() => validate(data, schema)).toThrow(new ValidationError('Property name must be of type String'));
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
      expect(validate(data, postSchemaDef)).toEqual(data);
    });
    test('should throw an error when the ref property is not ref', () => {
      const UserSchema = new Schema({ name: String });
      const schema = new Schema({ user: { type: UserSchema, ref: 'User' } });
      const data = {
        user: 34,
      };
      expect(() => validate(data, schema)).toThrow(new ValidationError('Property user must be of type Reference'));
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

      validate(): unknown {
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

      expect(validate(data, UserSchema)).toEqual(data);
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

      expect(() => validate(data, UserSchema)).toThrow(ValidationError);

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
      expect(() => validate(data, UserSchema2)).toThrow(new ValidationError('Required!'));
    });
  });
  describe('Schema Mixed Type', () => {
    test('Check Mixed Schema Type Variants', () => {
      const UserSchema = new Schema({
        inline: Schema.Types.Mixed,
        type: { type: Schema.Types.Mixed, required: true },
        any: Object,
        other: {},
      });
      const data = {
        inline: { name: 'george' },
        type: {
          email: 'george@gmail.com',
        },
        any: 'Hello',
        other: { hello: 'hello' },
      };

      expect(validate(data, UserSchema)).toEqual(data);
    });

    test('Check Mixed Schema Type Variants if is MixedType', () => {
      const UserSchema = new Schema({
        inline: Schema.Types.Mixed,
        type: { type: Schema.Types.Mixed, required: true },
        any: Object,
        other: {},
      });

      expect(UserSchema.fields.inline).toBeInstanceOf(MixedType);
    });

    test('Check Mixed Schema Type required validation', () => {
      const UserSchema = new Schema({
        type: { type: Schema.Types.Mixed, required: true },
        any: Object,
      });
      const data = {
        any: 'Hello',
      };
      const run = () => validate(data, UserSchema);
      expect(run).toThrow('Property type is required');
    });

    test('Check Mixed Schema Type custom validation', () => {
      const validator = (val) => {
        if (!val.hasOwnProperty('hello')) {
          throw new Error('Property "hello" is required');
        }
      };
      const UserSchema = new Schema({
        type: { type: Schema.Types.Mixed, validator },
      });
      const data = {
        type: { helio: 'helio' },
      };
      const run = () => validate(data, UserSchema);
      expect(run).toThrow('Property "hello" is required');
    });
  });
  describe('Test internal Ottoman Schema Types', () => {
    test('Check Basic Internal Types', () => {
      const CustomSchema = new Schema({
        number: Schema.Types.Number,
        string: Schema.Types.String,
        array: [Schema.Types.Number],
        date: Schema.Types.Date,
        boolean: Schema.Types.Boolean,
        mixed: { type: Schema.Types.Mixed },
      });

      const data = {
        number: 10,
        string: 'hello',
        date: new Date(),
        array: [1, 2, 3],
        boolean: false,
        mixed: { hello: 'hello' },
      };

      expect(validate(data, CustomSchema)).toEqual(data);
    });
  });
});
