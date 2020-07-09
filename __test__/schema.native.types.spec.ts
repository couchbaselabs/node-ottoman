import { applyDefaultValue, castSchema, ValidationError, BuildSchemaError } from '../lib';
import { Schema, ModelObject } from '../lib/schema/schema';

describe('Schema Native Types', () => {
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

        const schema2 = new Schema({ name: String, birthday: Date, createdAt: { type: Date, default: '2000-01-01' } });
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
});
