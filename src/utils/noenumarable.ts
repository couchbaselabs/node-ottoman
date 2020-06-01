/**
 * Set a given property of the target to be no-enumerable
 * Will be no listed on Object.keys and will be exclude by spread operator
 */
export const nonenumerable = (target: any, propertyKey: string) => {
  let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
  if (descriptor.enumerable !== false) {
    descriptor.enumerable = false;
    descriptor.writable = true;
    Object.defineProperty(target, propertyKey, descriptor);
  }
};
