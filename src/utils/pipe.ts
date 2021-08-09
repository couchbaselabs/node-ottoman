/**
 * Performs left-to-right function composition for asynchronous functions.
 */
export const pipe =
  (...fns) =>
  async (arg) => {
    for (const fn of fns) {
      await fn(arg);
    }
  };
