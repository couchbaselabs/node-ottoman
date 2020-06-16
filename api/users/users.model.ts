import { Schema, model } from '../../lib';
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

UserSchema.index.findByName = { by: 'name', options: { limit: 4, select: 'name' } };
UserSchema.index.findByEmail = { by: 'settings.email' };

export const UserModel = model('User', UserSchema);
