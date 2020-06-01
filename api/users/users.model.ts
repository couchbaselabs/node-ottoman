import { fnSchema, model } from '../../src';

const UserSchema = fnSchema({
  name: String,
  isActive: Boolean,
});

export const UserModel = model('User', UserSchema);
