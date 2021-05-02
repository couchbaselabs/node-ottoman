import { BuildSchemaError, Schema, model, registerGlobalPlugin } from '../src';
import { delay } from './testData';

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
      // @ts-ignore
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
      // @ts-ignore
      expect(() => schema.post('other', () => console.log('Yes'))).toThrow(BuildSchemaError);
    });
  });
  describe('Plugins', () => {
    test('should apply a plugin', () => {
      const fnPlugin = (s) => expect(s).toEqual(schema);
      schema.plugin(fnPlugin);
    });
    test('Apply global plugin', async () => {
      let log1 = false;
      let log2 = false;
      const logPluginPre1 = (schema) =>
        schema.pre('save', () => {
          log1 = true;
        });
      const logPluginPre2 = (schema) =>
        schema.pre('save', () => {
          log2 = true;
        });
      registerGlobalPlugin(...[logPluginPre1, logPluginPre2]);
      const userSchema = new Schema({ name: String });
      const User = model('User', userSchema);
      const user = new User({ name: 'John' });
      await user.save();
      await user.remove();
      expect(log1).toEqual(true);
      expect(log2).toEqual(true);
    });
  });
});
