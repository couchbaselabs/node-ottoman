import { FindByIdOptions, getDefaultInstance, model, Model, Query, Schema } from '../src';
import { Document } from '../src/model/document';
import { consistency, startInTest } from './testData';

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
    const document = await UserModel.findOne({}, consistency);
    const document1 = await UserModel.findOne({}, consistency);
    await UserModel.removeById(id);
    validation(document.toObject(), document1, UserModel);
  });
  test('Query lean -> findOne', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id } = await UserModel.create(doc);
    const document = await UserModel.findOne({}, { lean: true, ...consistency });
    const document1 = await UserModel.findOne({}, consistency);
    await UserModel.removeById(id);
    validation(document, document1, UserModel);
  });
  test('Query lean -> findById', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id } = await UserModel.create(doc);
    const document = await UserModel.findById(id, { lean: true, ...consistency });
    const document1 = await UserModel.findById(id);
    await UserModel.removeById(id);
    validation(document, document1, UserModel);
  });
  test('Query lean -> find', async () => {
    const UserModel = model('User', schema);
    await startInTest(getDefaultInstance());
    const { id } = await UserModel.create(doc);
    const { rows: documents } = await UserModel.find(
      { name: 'Ottoman Access Find Lean' },
      { lean: true, ...consistency },
    );
    const { rows: documents1 } = await UserModel.find({ name: 'Ottoman Access Find Lean' }, consistency);
    await UserModel.removeById(id);
    validation(documents[0], documents1[0], UserModel);
  });

  test('Query lean -> populate', async () => {
    const catData = {
      name: 'Figaro',
      age: 6,
    };

    const userData = {
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

    const UserSchema = new Schema({
      type: String,
      isActive: Boolean,
      name: String,
      card: { type: CardSchema, ref: 'Card' },
      cats: [{ type: CatSchema, ref: 'Cat' }],
    });

    const Issue = model('Issue', IssueSchema);
    const Card = model('Card', CardSchema);
    const Cat = model('Cat', CatSchema);
    const User = model('User', UserSchema);

    await startInTest(getDefaultInstance());

    const issueDoc = await Issue.create({ title: 'stolen card' });
    const cardInfoWithIssue = {
      cardNumber: '4242 4242 4242 4242',
      zipCode: '42424',
      issues: [issueDoc.id],
    };
    const cardDoc = await Card.create(cardInfoWithIssue);
    const cat1Doc = await Cat.create(catData);
    const cat2Doc = await Cat.create({ name: 'Garfield', age: 27 });
    const userDoc = new User(userData);
    userDoc.card = cardDoc.id;
    userDoc.cats = [cat1Doc.id, cat2Doc.id];
    const saved = await userDoc.save();

    const options: FindByIdOptions = { select: 'card, cats, name', populate: '*', lean: true, populateMaxDeep: 2 };
    // FIND BY ID
    let userWithLean = await User.findById(saved.id, options);
    let userWithoutLean = await User.findById(saved.id, { ...options, lean: false });
    validation(userWithLean, userWithoutLean, User);
    expect(() => userWithLean.toJSON()).toThrow('userWithLean.toJSON is not a function');
    // FIND ONE
    userWithLean = await User.findOne({ id: saved.id }, { ...options, ...consistency });
    userWithoutLean = await User.findOne({ id: saved.id }, { ...options, lean: false, ...consistency });
    validation(userWithLean, userWithoutLean, User);
    // FIND
    userWithLean = await User.find({ id: saved.id }, { ...options, ...consistency });
    userWithoutLean = await User.find({ id: saved.id }, { ...options, lean: false, ...consistency });
    validation(userWithLean.rows[0], userWithoutLean.rows[0], User);
  });

  function validation(document: any, document1: any, model: any) {
    instanceOfValidations(document, model);
    instanceOfValidations(document1, model, true);
    expect(document).toBeInstanceOf(Object);
    expect(document.constructor.name).toBe('Object');
    expect(document).not.toStrictEqual(document1);
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
