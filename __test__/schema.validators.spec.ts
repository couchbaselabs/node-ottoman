import { addValidators, castSchema, Schema } from '../lib';

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
    expect(castSchema(data, TestSchema)).toEqual({ name: 'Joseph', score: 1234 });
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
    expect(() => castSchema(data, TestSchema)).toThrow(new Error('Not an integer!'));
  });

  test("should throw an error if custom validator doesn't exist", () => {
    const schemaDef = {
      name: {
        type: String,
        validator: 'fake',
      },
    };
    expect(() => castSchema({ name: 'John' }, new Schema(schemaDef))).toThrow(Error);
  });
  test("should throw an error if validator isn't a string or function", () => {
    const schemaDef = new Schema({
      name: {
        type: String,
        validator: 1,
      },
    });
    expect(() => castSchema({ name: 'John' }, schemaDef)).toBeTruthy();
  });
});
