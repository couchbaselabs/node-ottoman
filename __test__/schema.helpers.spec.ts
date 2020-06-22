import { applyValidator } from '../lib/schema/helpers';

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
