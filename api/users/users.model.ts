import { createSchema, model } from '../../src';

const UserSchema = createSchema({
  name: String,
  isActive: Boolean,
});

export const UserModel = model('User', UserSchema);
