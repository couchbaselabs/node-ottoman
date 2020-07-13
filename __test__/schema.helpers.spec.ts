import { applyValidator } from '../src/schema/helpers';
import { ValidationError } from '../src';

describe('Schema Helpers', () => {
  test('should return void when using ValidatorOption in the validator and the value is valid', () => {
    expect(applyValidator('Sample value', { message: 'Only letters', regexp: new RegExp('\\w') })).toBeUndefined();
  });
  test("should return a message when using ValidatorOption in the validator and the value isn't valid", () => {
    expect(() => applyValidator('Sample value', { message: 'Only numbers', regexp: new RegExp('\\d') })).toThrow(
      new ValidationError('Only numbers'),
    );
  });
  test('should return a message when receiving a String as result of the validator function', () => {
    const validator = (val) => {
      throw new Error(`Value "${val}" not allowed`);
    };
    expect(() => applyValidator('Sample value', validator)).toThrow('Value "Sample value" not allowed');
  });
});
