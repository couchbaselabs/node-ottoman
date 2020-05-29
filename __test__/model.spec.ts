import { model } from '../lib';

class User {
  constructor(public name: string) {}
}

const accessDoc = {
  type: 'airlineR',
  id: 8099,
  callsign: 'CBS',
  user: new User('John Access'),
  letters: ['a', 'b'],
  isActive: false,
  createAt: new Date(),
  name: 'Ottoman Access',
};

describe('Test Document Access Functions', () => {
  test('Insert 1 document', async () => {
    const schema = {
      type: String,
      id: Number,
      createAt: Date,
      isActive: Boolean,
      letters: [String],
      user: User,
    };
    const UserModel = model('User', schema);
    const result = await UserModel.create(accessDoc);
    expect(result.token).toBeDefined();
  });
  test('Insert multiple document', async () => {
    const schema = {
      type: String,
      id: Number,
      createAt: Date,
      isActive: Boolean,
      letters: [String],
      user: User,
    };
    const UserModel = model('User', schema);
    const result = await UserModel.insertMany([accessDoc, accessDoc]);
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ cas: expect.anything(), token: expect.anything() })]),
    );
  });
});
