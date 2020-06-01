import { validateSchema, createSchema, applyDefaultValue, ValidationError, BuildSchemaError } from '../lib';
import { applyValidator } from '../lib/schema/helpers';
import { Schema } from '../lib/schema/schema';

describe('Schema Helpers', () => {
  test('should return empty array when validator is undefined', () => {
    expect(applyValidator('Sample value', undefined)).toEqual([]);
  });
  test('should return empty array when validator is a ValidatorOption and is valid', () => {
    expect(applyValidator('Sample value', { message: 'Only letters', regexp: new RegExp('\\w') })).toEqual([]);
  });
  test("should return array when validator is a ValidatorOption and isn't valid", () => {
    expect(applyValidator('Sample value', { message: 'Only numbers', regexp: new RegExp('\\d') })).toEqual([
      'Only numbers',
    ]);
  });
  test('should return array when validator is a String result of function validator called', () => {
    expect(applyValidator('Sample value', 'Not allow value')).toEqual(['Not allow value']);
  });
});
describe('Schema Types', () => {
  class MocType {}
  test('should throw an error when defining in schema unsupported type.', () => {
    const schema = { name: MocType };
    expect(() => createSchema(schema)).toThrow(new BuildSchemaError('Invalid type specified in property "name"'));
  });

  test('should throw an Error when defining auto value and default value', () => {
    const schema = {
      firstName: { type: String, default: 'John', auto: 'uuid' },
    };
    expect(() => createSchema(schema)).toThrow(
      new BuildSchemaError('Property firstName cannot be both auto and have a default.'),
    );
  });

  test('should return true when data is valid', () => {
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
      experience: { type: Number, min: { val: 2, message: 'Min allow is two' }, max: 4 },
    };
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      hasChild: true,
      age: 23,
      experience: 3,
    };
    expect(validateSchema(data, schema)).toBeTruthy();
  });

  test('should return true when data with metadata is valid', () => {
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
      age: { type: Number, required: true },
      experience: { type: Number, min: { val: 2, message: 'Min allow is two' }, max: 4 },
    };
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      hasChild: true,
      age: 23,
      experience: 3,
      id: 233,
    };
    expect(validateSchema(data, schema)).toBeTruthy();
  });

  test('should throw an error when it does not have value on require property.', () => {
    const personSchema = {
      name: { type: String, required: true },
      hasChild: { type: Boolean, required: true },
    };
    const personData = {
      name: '',
    };
    expect(() => validateSchema(personData, personSchema)).toThrow(ValidationError);

    const schemaWithFunction = { name: { type: String, required: () => true } };
    expect(() => validateSchema(personData, schemaWithFunction)).toThrow(ValidationError);
  });

  test('should applied correctly default values', () => {
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

  test('should throw an Error when validator fails', () => {
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
    expect(() => validateSchema(data, schema)).toThrow(ValidationError);

    const schemaWithRegex = {
      firstName: {
        type: String,
        validator: {
          message: 'Only numbers',
          regexp: new RegExp('d'),
        },
      },
    };
    expect(() => validateSchema(data, schemaWithRegex)).toThrow(ValidationError);
  });

  test('should return same schema when is passed to create', () => {
    const schema = createSchema({ name: String, hasChild: Boolean, age: { type: Number, intVal: true } });
    expect(createSchema(schema)).toBe(schema);
  });

  test("should exception when is schema haven't property type", () => {
    const schema = {
      name: String,
      hasChild: Boolean,
      age: { type: Number, intVal: true },
      amount: { min: 23, max: 24 },
    };
    expect(() => createSchema(schema)).toThrow(new BuildSchemaError('Invalid type specified in property "min"'));
  });
});
describe('Schema String Type', () => {
  test('should throw an Error when defining auto uuid value and is not String type ', () => {
    const schema = {
      firstName: { type: Boolean, auto: 'uuid' },
    };
    expect(() => createSchema(schema)).toThrow(new BuildSchemaError('Automatic uuid properties must be string typed.'));
  });

  test('should return schema instance when defining auto uuid value and is String type ', () => {
    const schema = {
      firstName: { type: String, auto: 'uuid' },
    };
    expect(createSchema(schema)).toBeDefined();
  });

  test('should throw an error when field is an enum string and value is not contained', () => {
    const schema = { color: { type: String, enum: ['Blue', 'Green', 'Yellow'] } };
    const data = { color: 'Black' };
    expect(() => validateSchema(data, schema)).toThrow(ValidationError);
  });
  test('should return true when field is an enum string and value is contained', () => {
    const schema = { color: { type: String, enum: ['Blue', 'Green', 'Yellow'] } };
    const data = { color: 'Green' };
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
    expect(() => createSchema(schema)).toThrow(BuildSchemaError);
  });
});
describe('Schema Number Type', () => {
  test('should throw an Error when value is less than min', () => {
    const data = {
      age: 23,
    };
    const schemaWithObject = {
      age: { type: Number, min: { val: 30, message: 'Only 30 or less years' } },
    };
    expect(() => validateSchema(data, schemaWithObject)).toThrow(new ValidationError('Only 30 or less years'));

    const validator1 = () => {
      return { val: 30, message: 'Only 30 or less years' };
    };
    const schemaWithFunctionObj = { age: { type: Number, min: validator1 } };
    expect(() => validateSchema(data, schemaWithFunctionObj)).toThrow(new ValidationError('Only 30 or less years'));

    const validator2 = () => 30;
    const schemaWithFunctionNum = { age: { type: Number, min: validator2 } };
    expect(() => validateSchema(data, schemaWithFunctionNum)).toThrow(new ValidationError('23 is less than 30'));
  });

  test('should throw an Error when value is more than max', () => {
    const data = {
      age: 35,
    };
    const schemaWithObject = {
      age: { type: Number, max: { val: 30, message: 'Only 30 or more years' } },
    };
    expect(() => validateSchema(data, schemaWithObject)).toThrow(new ValidationError('Only 30 or more years'));

    const validator1 = () => {
      return { val: 30, message: 'Only 30 or more years' };
    };
    const schemaWithFunctionObj = { age: { type: Number, max: validator1 } };
    expect(() => validateSchema(data, schemaWithFunctionObj)).toThrow(new ValidationError('Only 30 or more years'));

    const validator2 = () => 30;
    const schemaWithFunctionNum = { age: { type: Number, max: validator2 } };
    expect(() => validateSchema(data, schemaWithFunctionNum)).toThrow(new ValidationError('35 is more than 30'));
  });

  test('should throw an Error when value is not integer', () => {
    const data = {
      age: 35.6,
    };
    const schema = {
      age: { type: Number, intVal: true },
    };
    expect(() => validateSchema(data, schema)).toThrow(new ValidationError('Property age only allow Integer values'));
  });

  test('should return true when value is allow by schema def', () => {
    const dataInteger = {
      age: 35,
    };
    const schemaInteger = {
      age: { type: Number, intVal: true, min: 4, max: 100 },
    };
    expect(() => validateSchema(dataInteger, schemaInteger)).toBeTruthy();

    const dataDecimal = {
      age: 35.45,
    };
    const schemaDecimalWithoutDefIntVal = {
      age: { type: Number, min: 4, max: 100 },
    };
    expect(() => validateSchema(dataDecimal, schemaDecimalWithoutDefIntVal)).toBeTruthy();

    const schemaDecimalWithDefIntVal = {
      age: { type: Number, intVal: false, min: 4, max: 100 },
    };
    expect(() => validateSchema(dataDecimal, schemaDecimalWithDefIntVal)).toBeTruthy();
  });
});
describe('Schema Date Types', () => {
  describe('Default Value', () => {
    const modelInstance = {
      name: 'John Doe',
      birthday: new Date('2000-01-01'),
    };
    test('should return valid date after apply default values', () => {
      const schema1 = { name: String, birthday: Date, createdAt: { type: Date, default: Date.now } };
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

    test('should not change the current value after apply default values', () => {
      const schema = { name: String, birthday: { type: Date, default: Date.now } };
      const updateInstance = applyDefaultValue(modelInstance, schema);
      expect(updateInstance.birthday).toBeDefined();
      expect(updateInstance.birthday).toEqual(modelInstance.birthday);
    });
  });

  const validationsFailAssertions = (data, schema1, schema2, schema3, schema4, schema5, opts) => {
    expect(() => validateSchema(data, schema1)).toThrow(ValidationError);
    expect(() => validateSchema(data, schema2)).toThrow(ValidationError);
    expect(() => validateSchema(data, schema3)).toThrow(ValidationError);
    expect(() => validateSchema(data, schema4)).toThrow(new ValidationError(opts.message));
    expect(() => validateSchema(data, schema5)).toThrow(new ValidationError(opts.message));
  };
  const validationsSuccessAssertions = (data, schema1, schema2, schema3, schema4, schema5) => {
    expect(validateSchema(data, schema1)).toBeTruthy();
    expect(validateSchema(data, schema2)).toBeTruthy();
    expect(validateSchema(data, schema3)).toBeTruthy();
    expect(validateSchema(data, schema4)).toBeTruthy();
    expect(validateSchema(data, schema5)).toBeTruthy();
  };

  describe('Min Validation', () => {
    const _minDate = new Date('1999-12-31');
    const schema1 = { name: String, birthday: { type: Date, min: '1999-12-31' } };
    const schema2 = { name: String, birthday: { type: Date, min: _minDate } };
    const schema3 = { name: String, birthday: { type: Date, min: () => _minDate } };
    const opts = { val: _minDate, message: 'Date not valid' };
    const schema4 = { name: String, birthday: { type: Date, min: opts } };
    const schema5 = { name: String, birthday: { type: Date, min: () => opts } };

    test('should return true when apply min validation with valid data', () => {
      const data = {
        name: 'John Doe',
        birthday: new Date('2000-01-01'),
      };
      validationsSuccessAssertions(data, schema1, schema2, schema3, schema4, schema5);
    });
    test('should throw validation error when min value date is not correctly', () => {
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
    const opts = { val: _maxDate, message: 'Date not valid' };
    const schema4 = { name: String, birthday: { type: Date, max: opts } };
    const schema5 = { name: String, birthday: { type: Date, max: () => opts } };

    test('should return true when apply max validation with valid data', () => {
      const data = {
        name: 'John Doe',
        birthday: new Date('2000-01-01'),
      };
      validationsSuccessAssertions(data, schema1, schema2, schema3, schema4, schema5);
    });

    test('should throw validation error when max value date is not correctly', () => {
      const data = {
        name: 'John Doe',
        birthday: new Date('2001-01-01'),
      };
      validationsFailAssertions(data, schema1, schema2, schema3, schema4, schema5, opts);
    });
  });
});
describe('Schema Array Types', () => {
  test('should create successfully array of a type', () => {
    const schemaString = {
      names: [String],
    };
    expect(createSchema(schemaString)).toBeDefined();
    const schemaBoolean = {
      names: [Boolean],
    };
    expect(createSchema(schemaBoolean)).toBeDefined();
  });

  describe('Array Type Validations', () => {
    test('should return true when all items of array are valid', () => {
      const schemaString = {
        names: [{ type: String, validator: { regexp: new RegExp('[a-zA-Z\\s]'), message: 'Only letters' } }],
      };
      const data = {
        names: ['John Due', 'Due John'],
      };
      expect(validateSchema(data, schemaString)).toBeTruthy();
      const schemaNumber = {
        amounts: [{ type: Number, max: { val: 10, message: 'Not valid value' } }],
      };
      const amountsData = {
        amounts: [2, 3, 4, 10],
      };
      expect(validateSchema(amountsData, schemaNumber)).toBeTruthy();
    });
    test('should throw error when any items of array are invalid', () => {
      const schemaString = {
        names: [{ type: String, validator: { regexp: new RegExp('[a-zA-Z\\s]'), message: 'Only letters' } }],
      };
      const data = {
        names: ['John Due', 'Due John23', '32323'],
      };
      expect(() => validateSchema(data, schemaString)).toThrow(new ValidationError('Only letters'));
      const schemaNumber = {
        amounts: [{ type: Number, max: { val: 10, message: 'Not valid value' } }],
      };
      const amountsData = {
        amounts: [20, 13, 54, 10],
      };
      expect(() => validateSchema(amountsData, schemaNumber)).toThrow(new ValidationError('Not valid value'));
    });
  });
});
describe('Schema Object Types', () => {
  test('should create a valid schema when create schema object', () => {
    const schema = {
      address: {
        line: String,
        line2: String,
        postalCode: { type: String, validator: { regexp: new RegExp('\\d'), message: 'Not valid postal code' } },
      },
    };
    const result = createSchema(schema);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Schema);
  });
});
