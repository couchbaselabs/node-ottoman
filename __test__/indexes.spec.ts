import { ensureIndexes, Schema, model } from '../lib';
import { delay } from './testData';

describe('Indexes', () => {
  const UserSchema = new Schema({
    name: String,
    email: String,
  });

  UserSchema.index.findN1qlByName = { by: 'name', options: { limit: 4, select: 'name' }, type: 'n1ql' };
  UserSchema.index.findN1qlByNameandEmail = {
    by: ['name', 'email'],
    options: { limit: 4, select: 'name, email' },
    type: 'n1ql',
  };
  UserSchema.index.findByEmail = { by: 'email', type: 'n1ql' };
  UserSchema.index.findByName = { by: 'name' };
  UserSchema.index.findViewByEmail = { by: 'email', type: 'view' };
  UserSchema.index.findRefName = { by: 'name', type: 'refdoc' };

  test('Testing indexes', async () => {
    const User = model('User', UserSchema);
    await ensureIndexes();

    const userData = { name: `index`, email: 'index@email.com' };
    const user = new User(userData);
    await user.save();

    await delay(2500);

    const usersN1ql = await User.findN1qlByName(userData.name);
    expect(usersN1ql.rows[0].name).toBe(userData.name);
    const usersN1qlByNameAndEmail = await User.findN1qlByNameandEmail(userData.name, userData.email);
    expect(usersN1qlByNameAndEmail.rows[0].name).toBe(userData.name);
    expect(usersN1qlByNameAndEmail.rows[0].email).toBe(userData.email);
    const usersView = await User.findByName(userData.name);
    expect(usersView).toBeDefined();
    const userRefdoc = await User.findRefName(userData.name);
    expect(userRefdoc.name).toBe(userData.name);
  });
});
