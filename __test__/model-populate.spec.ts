import { model, Schema, FindByIdOptions, FindOptions, SearchConsistency } from '../src';
import { delay } from './testData';

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
  name: 'Populate User',
};

const findPopulateDoc = {
  type: 'airlineR',
  isActive: false,
  name: 'Find Populate User',
};

const IssueSchema = new Schema({
  title: String,
  description: String,
});

const CardSchema = new Schema({
  number: String,
  zipCode: String,
  issues: [{ type: IssueSchema, ref: 'Issue' }],
});

const CatSchema = new Schema({
  name: String,
  age: Number,
});

describe('Test populate feature', () => {
  test('populate card data', async () => {
    const Card = model('Card', CardSchema);
    const schema = new Schema({
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

  test('findById.populate Card and Cat references', async () => {
    const Card = model('Card', CardSchema);
    const Cat = model('Cat', CatSchema);
    const schema = new Schema({
      type: String,
      isActive: Boolean,
      name: String,
      card: { type: CardSchema, ref: 'Card' },
      cats: [{ type: CatSchema, ref: 'Cat' }],
    });
    const User = model('User', schema);
    const cardCreated = await Card.create(cardInfo);
    const catCreated = await Cat.create(myCat);
    const catCreated2 = await Cat.create({ name: 'Garfield', age: 27 });
    const user = new User(populateDoc);
    user.card = cardCreated.id;
    user.cats = [catCreated.id, catCreated2.id];
    const saved = await user.save();
    const result = await User.findById(saved.id);
    await result._populate();
    expect(result).toBeDefined();
  });

  test('Find.populate Card and Cat  references', async () => {
    const Issue = model('Issue', CardSchema);
    const Card = model('Card', CardSchema);
    const Cat = model('Cat', CatSchema);
    const schema = new Schema({
      type: String,
      isActive: Boolean,
      name: String,
      card: { type: CardSchema, ref: 'Card' },
      cats: [{ type: CatSchema, ref: 'Cat' }],
    });
    const User = model('User', schema);
    const issueCreated = await Issue.create({ title: 'broken card' });
    const cardInfoWithIssue = {
      cardNumber: '4242 4242 4242 4242',
      zipCode: '42424',
      issues: [issueCreated.id],
    };
    const cardCreated = await Card.create(cardInfoWithIssue);
    const catCreated = await Cat.create(myCat);
    const catCreated2 = await Cat.create({ name: 'Garfield', age: 27 });
    const user = new User(findPopulateDoc);
    user.card = cardCreated.id;
    user.cats = [catCreated.id, catCreated2.id];

    await user.save();

    await delay(2000);
    const options = new FindOptions({
      select: 'name, cats, card',
      limit: 5,
      populate: ['cats', 'card'],
      populateMaxDeep: 2,
      consistency: SearchConsistency.GLOBAL,
    });
    const result = await User.find({ name: user.name }, options);
    expect(result.rows.length).toBeGreaterThanOrEqual(1);
    const item = result.rows[0];
    expect(item.card.cardNumber).toBe(cardInfoWithIssue.cardNumber);
    expect(item.card.issues[0].title).toBe('broken card');
    expect(item.cats.length).toBe(user.cats.length);
  });

  test('Find.populate recursive', async () => {
    const Issue = model('Issue', CardSchema);
    const Card = model('Card', CardSchema);
    const Cat = model('Cat', CatSchema);
    const schema = new Schema({
      type: String,
      isActive: Boolean,
      name: String,
      card: { type: CardSchema, ref: 'Card' },
      cats: [{ type: CatSchema, ref: 'Cat' }],
    });
    const issueCreated = await Issue.create({ title: 'stolen card' });
    const cardInfoWithIssue = {
      cardNumber: '4242 4242 4242 4242',
      zipCode: '42424',
      issues: [issueCreated.id],
    };
    const User = model('User', schema);
    const cardCreated = await Card.create(cardInfoWithIssue);
    const catCreated = await Cat.create(myCat);
    const catCreated2 = await Cat.create({ name: 'Garfield', age: 27 });
    const user = new User(populateDoc);
    user.card = cardCreated.id;
    user.cats = [catCreated.id, catCreated2.id];
    const saved = await user.save();

    const options = new FindByIdOptions({ select: 'card, cats, name' });
    expect(options.select).toBe('card, cats, name');
    const result = await User.findById(saved.id, options);
    expect(result.name).toBeDefined();
    expect(result.card).toBeDefined();
    expect(result.cats).toBeDefined();
    expect(result.isActive).toBeUndefined();
    expect(result._populated('card')).toBe(false);
    await result._populate('*', 2);
    expect(result._populated('card')).toBe(true);
    expect(result.card.cardNumber).toBe('4242 4242 4242 4242');
    expect(result.card.issues[0].title).toBe('stolen card');
    expect(result.cats.length).toBe(2);
    await result._depopulate('card');
    expect(result._populated('card')).toBe(false);
  });
});
