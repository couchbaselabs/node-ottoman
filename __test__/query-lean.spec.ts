import { FindByIdOptions, getDefaultInstance, model, Model, Schema, SearchConsistency } from '../src';
import { delay, startInTest } from './testData';
import { Document } from '../src/model/document';

describe('Test Support Query Lean', () => {
  const schema = {
    type: String,
    isActive: Boolean,
    name: String,
  };
  const doc = {
    type: 'airline',
    isActive: false,
    name: 'Ottoman Access Find Lean',
  };
  test('Query lean -> toObject', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id } = await UserModel.create(doc);
    await delay(500);
    const document = await UserModel.findOne({}, { consistency: SearchConsistency.LOCAL });
    const document1 = await UserModel.findOne({}, { consistency: SearchConsistency.LOCAL });
    await UserModel.removeById(id);
    validation(document.toObject(), document1, UserModel);
  });
  test('Query lean -> findOne', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id } = await UserModel.create(doc);
    await delay(500);
    const document = await UserModel.findOne({}, { consistency: SearchConsistency.LOCAL, lean: true });
    const document1 = await UserModel.findOne({}, { consistency: SearchConsistency.LOCAL });
    await UserModel.removeById(id);
    validation(document, document1, UserModel);
  });
  test('Query lean -> findById', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id } = await UserModel.create(doc);
    await delay(500);
    const document = await UserModel.findById(id, { lean: true });
    const document1 = await UserModel.findById(id);
    await UserModel.removeById(id);
    validation(document, document1, UserModel);
  });
  test('Query lean -> find', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id } = await UserModel.create(doc);
    await delay(500);
    const { rows: documents } = await UserModel.find({ name: 'Ottoman Access Find Lean' }, { lean: true });
    const { rows: documents1 } = await UserModel.find({ name: 'Ottoman Access Find Lean' });
    await UserModel.removeById(id);
    validation(documents[0], documents1[0], UserModel);
  });

  test('Query lean -> populate ', async () => {
    const myCat = {
      name: 'Figaro',
      age: 6,
    };

    const populateDoc = {
      type: 'airlineR',
      isActive: false,
      name: 'Populate User',
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

    const options = new FindByIdOptions({ select: 'card, cats, name', populate: '*', lean: true });
    const document = await User.findById(saved.id, options);
    delete options.lean;
    const document1 = await User.findById(saved.id, options);
    validation(document, document1, User);
  });

  function validation(document: any, document1: any, model: any) {
    instanceOfValidations(document, model);
    instanceOfValidations(document1, model, true);
    expect(document).toBeInstanceOf(Object);
    expect(document.constructor.name).toBe('Object');
    expect(JSON.stringify(document1)).toEqual(JSON.stringify(document));
  }

  function instanceOfValidations(document: any, model: any, asDocument = false) {
    expect(document instanceof model).toBe(asDocument);
    expect(document instanceof Model).toBe(asDocument);
    expect(document instanceof Document).toBe(asDocument);

    if (!asDocument) {
      expect(document).toBeInstanceOf(Object);
      expect(document.constructor.name).toBe('Object');
    }
  }
});
