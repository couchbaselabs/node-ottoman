import { Schema, model, ViewIndexOptions, getDefaultConnection } from '../src';
import { delay, startInTest } from './testData';

describe('Indexes', () => {
  const UserSchema = new Schema({
    name: String,
    email: String,
    card: {
      cardNumber: String,
      zipCode: String,
    },
    roles: [{ name: String }],
  });

  UserSchema.index.findN1qlByName = { by: 'name', options: { limit: 4, select: 'name' }, type: 'n1ql' };
  UserSchema.index.findN1qlByCardNumber = { by: 'card.cardNumber', type: 'n1ql' };
  UserSchema.index.findN1qlByRoles = { by: 'roles[*].name', type: 'n1ql' };
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
    await startInTest(getDefaultConnection());

    const userData = {
      name: `index`,
      email: 'index@email.com',
      card: { cardNumber: '424242425252', zipCode: '42424' },
      roles: [{ name: 'admin' }],
    };
    const user = new User(userData);
    await user.save();

    await delay(2500);

    const usersN1ql = await User.findN1qlByName(userData.name);
    expect(usersN1ql.rows[0].name).toBe(userData.name);

    const usersN1qlByCard = await User.findN1qlByCardNumber(userData.card.cardNumber);
    expect(usersN1qlByCard.rows[0].card.cardNumber).toBe(userData.card.cardNumber);

    const usersN1qlByNameAndEmail = await User.findN1qlByNameandEmail([userData.name, userData.email]);
    expect(usersN1qlByNameAndEmail.rows[0].name).toBe(userData.name);
    expect(usersN1qlByNameAndEmail.rows[0].email).toBe(userData.email);

    const usersRolesN1ql = await User.findN1qlByRoles(userData.roles[0].name);
    expect(usersRolesN1ql.rows[0].roles[0].name).toBe(userData.roles[0].name);

    try {
      await User.findByName();
    } catch (e) {
      expect(e.message).toBe('Function findByName received wrong number of arguments');
    }

    try {
      await User.findByName(['must', 'fail']);
    } catch (e) {
      expect(e.message).toBe('Function findByName received wrong number of arguments');
    }

    const viewIndexOptions = new ViewIndexOptions({ limit: 1 });
    const usersView = await User.findByName(userData.name, viewIndexOptions);
    expect(usersView).toBeDefined();
    const userRefdoc = await User.findRefName(userData.name);
    expect(userRefdoc.name).toBe(userData.name);
  });
});
