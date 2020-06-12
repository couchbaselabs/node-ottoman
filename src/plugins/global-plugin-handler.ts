type PluginFunctions = () => void;

/**
 * Store global plugins.
 */
export const __plugins: PluginFunctions[] = [];

/**
 * Register a global plugin.
 */
export const registerGlobalPlugin = (...plugins) => {
  for (const plugin of plugins) {
    if (plugin && typeof plugin === 'function') {
      __plugins.push(plugin);
    } else {
      throw new Error('Unable to register the global plugin, only functions are allowed');
    }
  }
};

/**
 * Return all global plugins
 */
export const getGlobalPlugins = () => __plugins;
