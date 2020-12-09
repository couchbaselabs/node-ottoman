import { Schema, model, getDefaultInstance } from '../src';
import { startInTest } from './testData';

describe('Test Model-Schema Integration and Validations', () => {
  const CardSchema = new Schema({
    number: String,
    zipCode: String,
  });

  const CatSchema = new Schema({
    name: String,
    age: Number,
  });

  const cardInfo = {
    cardNumber: '5252 5252 5252 5252',
    zipCode: '52525',
  };

  const populateDoc = {
    isActive: false,
    name: 'Model-Schema User',
  };

  test('Ensure document save references instead of populated objects', async () => {
    const Card = model('Card', CardSchema);
    const Cat = model('Cat', CatSchema);
    const UserSchema = new Schema({
      isActive: Boolean,
      name: String,
      card: { type: CardSchema, ref: 'Card' },
      cats: [{ type: CatSchema, ref: 'Cat' }],
    });
    UserSchema.pre('save', (doc) => {
      expect(typeof doc.card).toBe('string');
      expect(typeof doc.cats[0]).toBe('string');
    });
    const User = model('User', UserSchema);

    await startInTest(getDefaultInstance());

    const cardCreated = await Card.create(cardInfo);
    const catCreated = await Cat.create({ name: 'Figaro', age: 6 });
    const catCreated2 = await Cat.create({ name: 'Garfield', age: 27 });
    const user = new User(populateDoc);
    user.card = cardCreated.id;
    user.cats = [catCreated.id, catCreated2.id];
    const validated = await user._validate();
    expect(validated).toBeTruthy();
    expect(user._getIdField()).toBe('id');
    await user.save();
    const result = await User.findById(user.id);
    await result._populate();
    expect(result.card.cardNumber).toBe(cardInfo.cardNumber);
    expect(result.cats[0].name).toBe('Figaro');
    await result.save();
    expect(typeof result.card).toBe('string');
    expect(typeof result.cats[0]).toBe('string');
  });

  test('test default values in Model constructor', async () => {
    const schema = new Schema({ name: String, dogs: { type: Number, default: 0 } });
    const Person = model('Person', schema, { idKey: 'name' });
    await startInTest(getDefaultInstance());
    const jane = new Person({ name: 'Jane' });
    expect(jane.dogs).toBe(0);
  });

  test('test default values', async () => {
    const schema = new Schema({ name: String, dogs: { type: Number, default: 0 } });
    const Person = model('Person', schema, { idKey: 'name' });
    await startInTest(getDefaultInstance());
    const john = new Person({ name: 'John' });
    expect(john.dogs).toBe(0);
    delete john.dogs;
    await john.save();
    const johnFetched = await Person.findById('John');
    expect(johnFetched.dogs).toBe(0);
  });

  test('cast value in model constructor', () => {
    const dateString = '2020-12-07T14:29:06.062Z';
    const schema = new Schema({
      created: Date,
    });
    const User = model('User', schema);
    const user = new User({ created: dateString });
    expect(user.created).toBeDefined();
    expect(user.created.toISOString()).toBe(dateString);
    expect(user.created instanceof Date).toBe(true);
  });
});
