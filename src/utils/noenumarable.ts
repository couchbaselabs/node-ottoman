/**
 * Set a given property of the target to be no-enumerable
 * Will not be listed on Object.keys and will be excluded by spread operator
 */
export const nonenumerable = (target: any, propertyKey: string) => {
  const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
  if (descriptor.enumerable !== false) {
    descriptor.enumerable = false;
    descriptor.writable = true;
    Object.defineProperty(target, propertyKey, descriptor);
  }
};
