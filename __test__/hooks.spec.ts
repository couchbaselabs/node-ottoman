import { createSchema, model } from '../lib';
const accessDoc2 = {
  type: 'hooks',
  isActive: false,
  name: 'Ottoman Hooks',
};

const schema = {
  type: String,
  isActive: Boolean,
  name: String,
};

test('Hook.pre.save', async () => {
  const UserSchema = createSchema(schema);
  UserSchema.pre('save', (document) => {
    document.name = 'async pre save';
  });

  const UserModel = model('User', UserSchema);
  const result = await UserModel.create(accessDoc2);
  const userSaved = await UserModel.findById(result.id);
  expect(userSaved.name).toBe('async pre save');
});
