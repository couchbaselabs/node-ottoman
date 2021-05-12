import { addValidators, validate, Schema, BuildSchemaError } from '../src';

describe('schema custom validators', () => {
  beforeAll(() => {
    // Add custom validators
    addValidators({
      string: (value) => {
        if (typeof value !== 'string') {
          throw new Error('Not a string!');
        }
      },
      integer: (value) => {
        // Numbers are converted to strings before entering validator functions
        const intRegex = /^\+?(0|[1-9]\d*)$/;
        if (!intRegex.test(String(value))) {
          throw new Error('Not an integer!');
        }
      },
    });
  });
  test('should validate the data with custom validators', () => {
    const TestSchema = new Schema({
      name: {
        type: String,
        validator: 'string', // reference the customer validator by name
      },
      score: {
        type: Number,
        validator: Schema.validators.integer, // direct ref to validator func
      },
    });

    const data = { name: 'Joseph', score: '1234' };
    expect(validate(data, TestSchema)).toEqual({ name: 'Joseph', score: 1234 });
  });

  test('should fail to validate bad data with custom validators', () => {
    const TestSchema = new Schema({
      name: {
        type: String,
        validator: 'string', // reference the customer validator by name
      },
      score: {
        type: Number,
        validator: Schema.validators.integer, // direct ref to validator func
      },
    });

    const data = { name: 'Joseph', score: 56.9 };
    expect(() => validate(data, TestSchema)).toThrow(new Error('Not an integer!'));
  });

  test("should throw an error if custom validator doesn't exist", () => {
    const schemaDef = {
      name: {
        type: String,
        validator: 'fake',
      },
    };
    expect(() => validate({ name: 'John' }, schemaDef)).toThrow(
      new Error(`Validator 'fake' for field 'name' does not exist.`),
    );
  });
  test("should throw an errors if validators aren't object", () => {
    // @ts-ignore
    expect(() => addValidators([])).toThrow(new BuildSchemaError('Validators must be an object.'));
  });

  test("should throw an errors if any validator aren't function", () => {
    expect(() =>
      addValidators({
        name: (val) => {
          console.log(val);
        },
        // @ts-ignore
        fails: 'Not valid',
      }),
    ).toThrow(new BuildSchemaError('Validator object properties must be functions.'));
  });
});
