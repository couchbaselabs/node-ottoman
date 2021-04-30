import { registerGlobalPlugin } from '../src';
import { __plugins, getGlobalPlugins } from '../src/plugins/global-plugin-handler';
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

    const plugin3 = () => {
      console.log('plugin 3');
    };

    const plugin4 = () => {
      console.log('plugin 4');
    };

    const plugin5 = () => {
      console.log('plugin 5');
    };

    registerGlobalPlugin(...plugins);
    registerGlobalPlugin(plugin3, plugin4);
    registerGlobalPlugin(plugin5);
    const globalPlugins = getGlobalPlugins();
    expect(globalPlugins.length).toStrictEqual(5);
    expect(__plugins.length).toStrictEqual(5);
    expect(globalPlugins[0]).toBeInstanceOf(Function);
    expect(globalPlugins[1]).toBeInstanceOf(Function);
    expect(globalPlugins[2]).toBeInstanceOf(Function);
    expect(globalPlugins[3]).toBeInstanceOf(Function);
    expect(globalPlugins[4]).toBeInstanceOf(Function);
    expect(globalPlugins[0].name).toBe(plugins[0].name);
    expect(globalPlugins[1].name).toBe(plugins[1].name);
    expect(globalPlugins[2].name).toBe(plugin3.name);
    expect(globalPlugins[3].name).toBe(plugin4.name);
    expect(globalPlugins[4].name).toBe(plugin5.name);
  });

  test('-> should throw a GlobalPluginHandlerError', () => {
    expect(() => registerGlobalPlugin([null])).toThrow(GlobalPluginHandlerError);
  });
});
