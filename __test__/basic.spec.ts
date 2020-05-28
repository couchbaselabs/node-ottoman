import { createModel } from '../lib';

class User {
  constructor(public name: string) {}
}

const doc = {
  type: 'airlineR',
  id: 8093,
  callsign: 'CBS',
  user: new User('John'),
  letters: ['a', 'b'],
  isActive: false,
  createAt: new Date(),
  name: 'Ottoman',
};

test('insert 1 document', async () => {
  const schema = {
    type: String,
    id: Number,
    createAt: Date,
    isActive: Boolean,
    letters: [String],
    user: User,
  };
  const UserModel = createModel('User', schema);
  const document = new UserModel(doc);
  const key = `${doc.type}_${doc.id}`;
  const result = await document.save(key);
  expect(result.token).toBeDefined();
});

test('query created document', async () => {
  const UserModel = createModel('User');
  const key = `${doc.type}_${doc.id}`;
  const result = await UserModel.find(key);
  expect(result.value).toBeDefined();
});
