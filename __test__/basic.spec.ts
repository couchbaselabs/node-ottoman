import { model } from '../lib';

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
  const UserModel = model('User', schema);
  const document = new UserModel(doc);
  const key = `${doc.type}_${doc.id}`;
  const result = await document.save(key);
  expect(result.token).toBeDefined();
});

test('query created document', async () => {
  const UserModel = model('User');
  const key = `${doc.type}_${doc.id}`;
  const result = await UserModel.find(key);
  expect(result.value).toBeDefined();
});

test('Create Document', async () => {
  const UserModel = model('User');
  const key = `${doc.type}_${doc.id}`;
  const result = await UserModel.create(key, {...doc, ...{id: 1234}});
  expect(result.token).toBeDefined();
});
