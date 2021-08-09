import { DocumentNotFoundError, FindByIdOptions, FindOptions, getDefaultInstance, model, Schema } from '../src';
import { consistency, startInTest } from './testData';

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
  cardNumber: String,
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

    await startInTest(getDefaultInstance());

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

    await startInTest(getDefaultInstance());

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

  test('findById return DocumentNotFound', async () => {
    const schema = new Schema({
      type: String,
      isActive: Boolean,
      name: String,
    });
    const User = model('User', schema);

    await startInTest(getDefaultInstance());
    try {
      await User.findById('hello');
    } catch (e) {
      expect(e).toBeInstanceOf(DocumentNotFoundError);
    }
  });

  test('findById.option.populate Card and Cat references', async () => {
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

    await startInTest(getDefaultInstance());

    const cardCreated = await Card.create(cardInfo);
    const catCreated = await Cat.create(myCat);
    const user = new User(populateDoc);
    user.card = cardCreated.id;
    user.cats = [catCreated.id];
    const saved = await user.save();
    const { card, cats } = await User.findById(saved.id, { populate: '*' });
    await Card.removeById(cardCreated.id);
    await Cat.removeById(catCreated.id);
    await User.removeById(saved.id);

    expect(card.id).toBe(cardCreated.id);
    expect(cats.length).toBe(1);
    expect(cats[0].id).toBe(catCreated.id);
  });

  test('Find.populate Card and Cat  references', async () => {
    const Issue = model('Issue', IssueSchema);
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

    await startInTest(getDefaultInstance());

    const issueCreated = await Issue.create({ title: 'broken card' });
    const cardInfoWithIssue = {
      cardNumber: '4242 4242 4242 4242',
      zipCode: '42424',
      issues: [issueCreated.id],
    };
    const cardCreated = await Card.create(cardInfoWithIssue);
    const catCreated = await Cat.create(myCat);
    const catCreated2 = await Cat.create({ name: 'Garfield', age: 27 });
    const userData = { ...findPopulateDoc, ...{ name: `${findPopulateDoc.name} ${Date.now()}` } };
    const user = new User(userData);
    user.card = cardCreated;
    user.cats = [catCreated, catCreated2];

    await user.save();

    const options = new FindOptions({
      limit: 3,
      populate: ['cats', 'card'],
      populateMaxDeep: 2,
      ...consistency,
    });
    let result = await User.find({ name: user.name }, options);
    expect(result.rows.length).toBeGreaterThanOrEqual(1);
    let item = result.rows[0];
    expect(item.card.cardNumber).toBe(cardInfoWithIssue.cardNumber);
    expect(item.card.issues[0].title).toBe('broken card');
    expect(item.cats.length).toBe(user.cats.length);

    result = await User.find({ name: user.name }, { ...options, ...{ select: 'cats, card' } });
    item = result.rows[0];
    expect(item.card.cardNumber).toBe(cardInfoWithIssue.cardNumber);
    expect(item.card.issues[0].title).toBe('broken card');
    expect(item.cats.length).toBe(user.cats.length);
  });

  test('Find.populate recursive', async () => {
    const Issue = model('Issue', IssueSchema);
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

    await startInTest(getDefaultInstance());

    const issueCreated = await Issue.create({ title: 'stolen card' });
    const cardInfoWithIssue = {
      cardNumber: '4242 4242 4242 4242',
      zipCode: '42424',
      issues: [issueCreated.id],
    };
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
