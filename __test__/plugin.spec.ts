import { Schema, model } from '../lib';
import { registerGlobalPlugin } from '../lib/plugins/global-plugin-handler';
const accessDoc2 = {
  type: 'hooks',
  isActive: false,
  name: 'Ottoman Hooks',
};

const schema = {
  type: String,
  isActive: Boolean,
  name: String,
};

describe('Test plugin', () => {
  test('Test global and local plugins on the same schema', async () => {
    const pluginLog3 = (schema) => {
      schema.methods.log3 = function () {
        return `log from global plugin ${this.type}`;
      };
    };
    registerGlobalPlugin(pluginLog3);

    try {
      registerGlobalPlugin({ fail: true });
    } catch (e) {
      expect(e.message).toBe('Unable to register the global plugin, only functions are allowed');
    }

    const UserSchema = new Schema(schema);

    const pluginLog2 = (schema) => {
      schema.methods.log2 = function () {
        return `log from plugin ${this.type}`;
      };
    };

    UserSchema.plugin(pluginLog2);
    UserSchema.index.findByName = { by: 'name' };
    const UserModel = model('User', UserSchema);

    const user = new UserModel(accessDoc2);
    expect(user.log2()).toBe(`log from plugin ${accessDoc2.type}`);
    expect(user.log3()).toBe(`log from global plugin ${accessDoc2.type}`);
  });
});
