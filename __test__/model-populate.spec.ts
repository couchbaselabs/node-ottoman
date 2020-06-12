import { model, createSchema } from '../lib';

const cardInfo = {
  cardNumber: '4242 4242 4242 4242',
  zipCode: '42424',
};

const myCat = {
  name: 'Figaro',
  age: 6,
};

const accessDoc = {
  type: 'airlineR',
  isActive: false,
  name: 'pop',
};

const populateDoc = {
  type: 'airlineR',
  isActive: false,
  name: 'pop & cat',
};

const CardSchema = createSchema({
  number: String,
  zipCode: String,
});

const CatSchema = createSchema({
  name: String,
  age: Number,
});

describe('Test populate feature', () => {
  test('populate card data', async () => {
    const Card = model('Card', CardSchema);
    const schema = createSchema({
      type: String,
      isActive: Boolean,
      name: String,
      card: { type: CardSchema, ref: 'Card' },
    });
    const User = model('User', schema);
    const cardCreated = await Card.create(cardInfo);
    const user = new User(accessDoc);
    user.card = cardCreated.id;
    const result = await user.save();
    expect(result.id).toBeDefined();
    await user._populate('card');
    expect(user.card.cardNumber).toBe(cardInfo.cardNumber);
  });

  test('populate Card and Cat references', async () => {
    const Card = model('Card', CardSchema);
    const Cat = model('Cat', CatSchema);
    const schema = createSchema({
      type: String,
      isActive: Boolean,
      name: String,
      card: { type: CardSchema, ref: 'Card' },
      cat: { type: CatSchema, ref: 'Cat' },
    });
    const User = model('User', schema);
    const cardCreated = await Card.create(cardInfo);
    const catCreated = await Cat.create(myCat);
    const user = new User(populateDoc);
    user.card = cardCreated.id;
    user.cat = catCreated.id;
    await user.save();
    const result = await User.find({ name: user.name }, { limit: 1, populate: 'cat card' });
    expect(result).toBeDefined();
  });
});
