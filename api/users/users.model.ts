import bcryptjs from 'bcryptjs';
import { Schema, model } from '../../lib';

const UserSchema = new Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
});

const hashPassword = (document) => {
  if (document.password && document.password.length < 60) {
    document.password = bcryptjs.hashSync(document.password, 10);
  }
};

UserSchema.pre('save', hashPassword);
UserSchema.pre('update', hashPassword);

UserSchema.methods.comparePasswordSync = function (password) {
  return bcryptjs.compareSync(password, this.password);
};

UserSchema.index.findN1qlByName = { by: 'name', options: { limit: 4, select: 'name' }, type: 'n1ql' };
UserSchema.index.findByEmail = { by: 'email', type: 'n1ql' };
UserSchema.index.findByName = { by: 'name' };
UserSchema.index.findViewByEmail = { by: 'email', type: 'view' };
UserSchema.index.findRefName = { by: 'name', type: 'refdoc' };

export const UserModel = model('User', UserSchema);
