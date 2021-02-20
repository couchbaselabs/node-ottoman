import { __plugins, getGlobalPlugins, registerGlobalPlugin } from '../src/plugins/global-plugin-handler';
import { GlobalPluginHandlerError } from '../src/plugins/global-plugin-handler-error';

describe('Global Plugin', () => {
  test('-> test add global plugin', () => {
    const plugins = [
      function plugin1() {
        console.log('plugin 1');
      },
      function plugin2() {
        console.log('plugin 2');
      },
    ];
    registerGlobalPlugin(...plugins);
    const globalPlugins = getGlobalPlugins();
    expect(globalPlugins.length).toStrictEqual(2);
    expect(__plugins.length).toStrictEqual(2);
    expect(globalPlugins[0]).toBeInstanceOf(Function);
    expect(globalPlugins[1]).toBeInstanceOf(Function);
    expect(globalPlugins[0].name).toBe(plugins[0].name);
    expect(globalPlugins[1].name).toBe(plugins[1].name);
  });
  test('-> should throw a GlobalPluginHandlerError', () => {
    expect(() => registerGlobalPlugin([null])).toThrow(GlobalPluginHandlerError);
  });
});
