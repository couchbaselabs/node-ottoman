import { ValidationError } from '../../lib';

export const makeResponse = async (res, action) => {
  try {
    const result = await action();
    res.json(result);
  } catch (e) {
    const status = e.message !== undefined && e.message.indexOf('not found') !== -1 ? 404 : 500;
    res.status(e instanceof ValidationError ? 400 : status);
    res.json({ message: e.message });
  }
};
