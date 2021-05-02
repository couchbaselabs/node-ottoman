import { FindOptions, getDefaultInstance, model, Schema, SearchConsistency } from '../src';
import { ModelTypes } from '../src/model/model.types';
import { delay, startInTest } from './testData';

describe('Test Model Find projection', () => {
  const SchemaBase = {
    type: String,
    isActive: Boolean,
    name: String,
  };
  const schema = new Schema(SchemaBase);
  const CUSTOM_ID_KEY = 'userListId';

  test('UserModel find function', async () => {
    const UserModel = model('User', schema, { idKey: CUSTOM_ID_KEY });
    await startInTest(getDefaultInstance());
    await UserModel.create({
      type: 'airline',
      isActive: false,
      name: 'Ottoman Access List Custom ID',
    });
    const filter = { name: 'Ottoman Access List Custom ID' };
    const options: FindOptions = { consistency: SearchConsistency.LOCAL, lean: true };
    const documents = await UserModel.find(filter, options);
    options.select = ['_type'];
    const documents1 = await UserModel.find(filter, options);
    const document = documents.rows[0];
    const document1 = documents1.rows[0];
    await UserModel.removeMany(filter);
    expect(document).toBeDefined();
    expect(
      Object.keys(document)
        .sort((a, b) => (a < b ? -1 : 1))
        .join(','),
    ).toBe('isActive,name,type,userListId');
    expect(document1).toStrictEqual({ _type: 'User' });
  });
  test('UserModel find function non strict schema', async () => {
    schema.options.strict = false;
    const UserModel = model('User', schema, { idKey: CUSTOM_ID_KEY });
    await startInTest(getDefaultInstance());
    await UserModel.create({
      type: 'airline',
      isActive: false,
      name: 'Ottoman Access List Custom ID',
      noExistOnSchema: true,
    });
    const filter = { name: 'Ottoman Access List Custom ID' };
    const options: FindOptions = { consistency: SearchConsistency.LOCAL, lean: true };
    const documents = await UserModel.find(filter, options);
    options.select = ['name'];
    const documents1 = await UserModel.find(filter, options);
    const document = documents.rows[0];
    const document1 = documents1.rows[0];
    await UserModel.removeMany(filter);
    expect(document).toBeDefined();
    expect(
      Object.keys(document)
        .sort((a, b) => (a < b ? -1 : 1))
        .join(','),
    ).toBe('_type,isActive,name,noExistOnSchema,type,userListId');
    expect(document1).toStrictEqual({ _type: 'User', name: 'Ottoman Access List Custom ID' });
  });
});

describe('Test Model Find projection on referenced objects', () => {
  const addressSchema = new Schema({
    address: String,
  });
  const personSchema = new Schema({
    name: String,
    age: Number,
    address: { type: addressSchema, ref: 'Address' },
  });
  const companySchema = new Schema({
    president: { type: personSchema, ref: 'Person' },
    ceo: { type: personSchema, ref: 'Person' },
    name: String,
    workers: [{ type: personSchema, ref: 'Person' }],
  });

  const getModels = () => ({
    Address: model('Address', addressSchema),
    Person: model('Person', personSchema),
    Company: model('Company', companySchema),
  });
  const cleanUp = async ({ Address, Company, Person }: { [K: string]: ModelTypes }) => {
    await Address.removeMany({ _type: 'Address' });
    await Person.removeMany({ _type: 'Person' });
    await Company.removeMany({ _type: 'Company' });
    await delay(300);
  };
  const fillData = async ({ Address, Company, Person }: { [K: string]: ModelTypes }) => {
    const johnAddress = await Address.create({ address: '13 Washington Square S, New York, NY 10012, USA' });
    const john = await Person.create({ name: 'John Smith', age: 52, address: johnAddress });

    const janeAddress = await Address.create({ address: '55 Clark St, Brooklyn, NY 11201, USA' });
    const jane = await Person.create({ name: 'Jane Doe', age: 45, address: janeAddress });

    const company = await Company.create({ name: 'Space X', president: john, ceo: jane });
    return { john, johnAddress, jane, janeAddress, company };
  };

  test('Populated all sub-objects', async () => {
    const { Address, Company, Person } = getModels();
    await startInTest(getDefaultInstance());
    await fillData({ Address, Company, Person });
    const spaceX = await Company.findOne({ name: 'Space X' });
    await spaceX._populate({ president: '*', ceo: '*' }, 2);

    await cleanUp({ Address, Company, Person });

    expect(spaceX).toBeDefined();
    const { president, ceo } = spaceX;
    expect(president).toBeDefined();
    expect(ceo).toBeDefined();
    const { name: pName, age: pAge, address: pAddress } = president;
    expect(pName).toBe('John Smith');
    expect(pAge).toBe(52);
    expect(pAddress).toBeDefined();
    const { address: pDir } = pAddress;
    expect(pDir).toBe('13 Washington Square S, New York, NY 10012, USA');
    const { name: cName, age: cAge, address: cAddress } = ceo;
    expect(cName).toBe('Jane Doe');
    expect(cAge).toBe(45);
    expect(cAddress).toBeDefined();
    const { address: oDir } = cAddress;
    expect(oDir).toBe('55 Clark St, Brooklyn, NY 11201, USA');
  });
  test('Sub-objects required only', async () => {
    const { Address, Company, Person } = getModels();
    await startInTest(getDefaultInstance());
    await fillData({ Address, Company, Person });
    const spaceX = await Company.findOne({ name: 'Space X' });
    await spaceX._populate({ president: 'name', ceo: 'name,age' }, 2);

    await cleanUp({ Address, Company, Person });

    expect(spaceX).toBeDefined();
    const { president, ceo } = spaceX;
    expect(president).toBeDefined();
    expect(ceo).toBeDefined();
    expect(president.toObject()).toStrictEqual({ name: 'John Smith' });
    expect(ceo.toObject()).toStrictEqual({ name: 'Jane Doe', age: 45 });
  });
  test('Sub-objects that can be populated deep 1', async () => {
    const { Address, Company, Person } = getModels();
    await startInTest(getDefaultInstance());
    const { johnAddress } = await fillData({ Address, Company, Person });

    const spaceX = await Company.findOne({ name: 'Space X' });
    await spaceX._populate({ president: 'name, address', ceo: 'age' }, 1);

    await cleanUp({ Address, Company, Person });

    expect(spaceX).toBeDefined();
    const { president, ceo } = spaceX;
    expect(president).toBeDefined();
    expect(ceo).toBeDefined();
    expect(president.toObject()).toStrictEqual({ name: 'John Smith', address: johnAddress.id });
    expect(ceo.toObject()).toStrictEqual({ age: 45 });
  });
  test('Sub-objects that can be populated deep 2', async () => {
    const { Address, Company, Person } = getModels();
    await startInTest(getDefaultInstance());
    const { johnAddress } = await fillData({ Address, Company, Person });

    const spaceX = await Company.findOne({ name: 'Space X' });
    await spaceX._populate({ president: 'address', ceo: 'age' }, 2);
    await cleanUp({ Address, Company, Person });

    expect(spaceX).toBeDefined();
    const { president, ceo } = spaceX;
    expect(president).toBeDefined();
    expect(ceo).toBeDefined();
    const { address } = president;
    expect(address).toBeDefined();
    expect(address.id).toStrictEqual(johnAddress.id);
    expect(ceo.toObject()).toStrictEqual({ age: 45 });
  });
  test(`Sub-object from Sub-objects that can be populated and select '*'`, async () => {
    const { Address, Company, Person } = getModels();
    await startInTest(getDefaultInstance());
    const { john, johnAddress, jane, janeAddress } = await fillData({ Address, Company, Person });
    const spaceX = await Company.findOne({ name: 'Space X' });

    await spaceX._populate({ president: { select: '*', populate: '*' }, ceo: { populate: 'address' } }, 2);

    await cleanUp({ Address, Company, Person });

    expect(spaceX).toBeDefined();
    const { president, ceo } = spaceX;
    expect(president).toBeDefined();
    expect(ceo).toBeDefined();
    const { address: pAddress } = president;
    expect(pAddress).toBeDefined();
    expect(pAddress.id).toBe(john.address);
    expect(pAddress.id).toBe(johnAddress.id);
    expect(pAddress.address).toBe(johnAddress.address);
    const { address: cAddress } = ceo;
    expect(cAddress).toBeDefined();
    expect(cAddress.id).toBe(jane.address);
    expect(cAddress.id).toBe(janeAddress.id);
    expect(cAddress.toObject()).toStrictEqual({ id: jane.address, address: janeAddress.address, _type: 'Address' });
  });
  test(`Sub-object from Sub-objects that can be populated using populated and select properties`, async () => {
    const { Address, Company, Person } = getModels();
    await startInTest(getDefaultInstance());
    const { john, johnAddress, jane, janeAddress } = await fillData({ Address, Company, Person });
    const spaceX = await Company.findOne({ name: 'Space X' });

    await spaceX._populate(
      {
        president: { select: 'address,id', populate: 'address' },
        ceo: { select: 'age', populate: { address: { select: 'address' } } },
      },
      2,
    );

    await cleanUp({ Address, Company, Person });

    expect(spaceX).toBeDefined();
    const { president, ceo } = spaceX;
    expect(president).toBeDefined();
    expect(ceo).toBeDefined();
    const { address: pAddress } = president;
    expect(pAddress).toBeDefined();
    expect(pAddress.id).toBe(john.address);
    expect(pAddress.id).toBe(johnAddress.id);
    expect(pAddress.toObject()).toStrictEqual({ id: john.address, address: johnAddress.address, _type: 'Address' });
    const { address: cAddress, age } = ceo;
    expect(cAddress).toBeDefined();
    expect(age).toBe(jane.age);
    expect(cAddress.toObject()).toStrictEqual({ address: janeAddress.address });
  });
  test(`CleanUp`, async () => {
    const { Address, Company, Person } = getModels();
    await startInTest(getDefaultInstance());
    await cleanUp({ Address, Company, Person });
  });
});
