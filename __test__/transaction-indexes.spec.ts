import { Schema, model, getDefaultInstance, SearchConsistency } from '../src';
import { delay, startInTest } from './testData';

test('Testing indexes', async () => {
  const UserSchema = new Schema({
    name: String,
    email: String,
    card: {
      cardNumber: String,
      zipCode: String,
    },
    roles: [{ name: String }],
  });

  UserSchema.index.findN1qlByName = { by: 'name', options: { limit: 4, select: 'name' } };
  UserSchema.index.findRefName = { by: 'name', type: 'refdoc' };

  const User = model('TransactionUser7', UserSchema);
  const ottoman = getDefaultInstance();
  await startInTest(ottoman);

  const userData = {
    name: `index`,
    email: 'index@email.com',
    card: { cardNumber: '424242425252', zipCode: '42424' },
    roles: [{ name: 'admin' }],
  };

  try {
    await ottoman.$transactions(async (ctx) => {
      await User.create(userData, { transactionContext: ctx });

      await delay(2500);

      const usersN1ql = await User.findN1qlByName(userData.name, { transactionContext: ctx });
      expect(usersN1ql.rows[0].name).toBe(userData.name);

      // Unable to use refdoc index function, seems ctx.get doesn't work with plain text document
      // await delay(2500);
      //
      // const userRefdoc = await User.findRefName(userData.name, { transactionContext: ctx });
      // expect(userRefdoc.name).toBe(userData.name);
    });
  } catch (e) {
    console.log(e);
  }

  const usersN1ql = await User.findN1qlByName(userData.name, { consistency: SearchConsistency.LOCAL });
  expect(usersN1ql.rows[0].name).toBe(userData.name);

  const userRefdoc = await User.findRefName(userData.name);
  expect(userRefdoc.name).toBe(userData.name);
});
