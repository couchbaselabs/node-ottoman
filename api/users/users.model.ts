import { Schema, model } from '../../lib';

const UserSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
});

UserSchema.index.findByName = { by: 'name', options: { limit: 4, select: 'name' }, type: 'n1ql' };
UserSchema.index.findByEmail = { by: 'email', type: 'n1ql' };
UserSchema.index.findViewByName = { by: 'name', type: 'view' };
UserSchema.index.findViewByEmail = { by: 'email', type: 'view' };
UserSchema.index.findRefName = { by: 'name', type: 'refdoc' };

export const UserModel = model('User', UserSchema);
