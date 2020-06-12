/**
 * Performs left-to-right function composition for asynchronous functions.
 */
export const pipe = (...fns) => (arg) => fns.reduce((p, f) => p.then(f), Promise.resolve(arg));
