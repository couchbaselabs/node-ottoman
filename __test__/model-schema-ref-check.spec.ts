import { getDefaultInstance, model, Schema } from '../src';
import { startInTest } from './testData';
import { InvalidModelReferenceError } from '../src/exceptions/ottoman-errors';

const accessDoc = {
  type: 'enforceRefCheck',
  isActive: false,
  name: 'check',
};

const CardSchema = new Schema({
  cardNumber: String,
  zipCode: String,
});

test('save with schema enforceRefCheck option', async () => {
  model('Card', CardSchema);

  const schema = new Schema(
    {
      type: String,
      isActive: Boolean,
      name: String,
      card: { type: CardSchema, ref: 'Card' },
    },
    { enforceRefCheck: 'throw' },
  );
  const User = model('User', schema);

  await startInTest(getDefaultInstance());

  const user = new User(accessDoc);
  user.card = 'no-existing-ID';
  try {
    await user.save();
  } catch (e) {
    expect(e).toBeInstanceOf(InvalidModelReferenceError);
  }
});

test('findById with schema enforceRefCheck option', async () => {
  model('Card', CardSchema);

  const schema = new Schema({
    type: String,
    isActive: Boolean,
    name: String,
    card: { type: CardSchema, ref: 'Card' },
  });
  const User = model('User', schema);

  await startInTest(getDefaultInstance());

  const user = new User(accessDoc);
  user.card = 'findById-no-existing-ID';
  await user.save();
  try {
    await User.findById(user.id, { populate: '*', enforceRefCheck: 'throw' });
  } catch (e) {
    expect(e).toBeInstanceOf(InvalidModelReferenceError);
  }
});

test('find with schema enforceRefCheck option', async () => {
  model('Card', CardSchema);

  const schema = new Schema({
    type: String,
    isActive: Boolean,
    name: String,
    card: { type: CardSchema, ref: 'Card' },
  });
  const User = model('User', schema);

  await startInTest(getDefaultInstance());

  const user = new User(accessDoc);
  user.card = 'find-no-existing-ID';
  await user.save();
  try {
    await User.find({ id: user.id }, { populate: '*', enforceRefCheck: 'throw' });
  } catch (e) {
    expect(e).toBeInstanceOf(InvalidModelReferenceError);
  }
  jest.spyOn(console, 'warn').mockImplementation();
  await User.find({ id: user.id }, { populate: '*', enforceRefCheck: true });
  expect(console.warn).toHaveBeenCalledWith(
    expect.stringContaining(
      `Reference to 'card' can't be populated cause document with id 'find-no-existing-ID' not found!`,
    ),
  );
});
