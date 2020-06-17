import { Schema, model } from '../../src';
import { CardSchema } from '../cards/cards.model';
import { CatSchema } from '../cats/cats.model';

const UserSchema = new Schema({
  type: String,
  isActive: Boolean,
  name: String,
  settings: {
    ttl: Number,
    email: String,
  },
  card: { type: CardSchema, ref: 'Card' },
  cat: { type: CatSchema, ref: 'Cat' },
});

UserSchema.index.findByName = { by: 'name', options: { limit: 4, select: 'name' }, type: 'n1ql' };
UserSchema.index.findByEmail = { by: 'settings.email', type: 'n1ql' };
UserSchema.index.findViewByName = { by: 'name', type: 'view' };
UserSchema.index.findViewByEmail = { by: 'settings.email', type: 'view' };
UserSchema.index.findRefName = { by: 'name', type: 'refdoc' };

export const UserModel = model('User', UserSchema);
