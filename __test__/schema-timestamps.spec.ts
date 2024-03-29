import { getDefaultInstance, model, Schema } from '../src';
import { delay, startInTest } from './testData';

describe(`Schema timestamps options`, () => {
  test('timestamps set to true', async () => {
    const schema = new Schema({ title: String }, { timestamps: true });
    const Travel = model('Travel', schema);
    await startInTest(getDefaultInstance());
    const travelLA = await Travel.create({ title: 'go to LA' });
    expect(travelLA.createdAt).toBeDefined();
    expect(travelLA.updatedAt).toBeDefined();
  });

  test('timestamps set createdAt to true and updatedAt to false', async () => {
    const schema = new Schema({ title: String }, { timestamps: { createdAt: true, updatedAt: false } });
    const Travel = model('Travel', schema);
    await startInTest(getDefaultInstance());
    const travelCA = await Travel.create({ title: 'go to CA' });
    expect(travelCA.createdAt).toBeDefined();
    expect(travelCA.updatedAt).toBeUndefined();
  });

  test('timestamps change key createdAt and updatedAt', async () => {
    const schema = new Schema(
      { title: String },
      { timestamps: { createdAt: 'dateCreated', updatedAt: 'dateUpdated' } },
    );
    const Travel = model('Travel', schema);
    await startInTest(getDefaultInstance());
    const travelDC = await Travel.create({ title: 'go to Washington DC' });
    expect(travelDC['dateCreated']).toBeDefined();
    expect(travelDC['dateUpdated']).toBeDefined();
  });

  test('timestamps test updateAt after update document', async () => {
    const schema = new Schema({ title: String }, { timestamps: true });
    const Travel = model('Travel', schema);
    await startInTest(getDefaultInstance());
    const travelFL = await Travel.create({ title: 'go to FL' });
    expect(travelFL.updatedAt).toBeDefined();
    await delay(3000);
    travelFL.title = 'go to FL Updated';
    await travelFL.save();
    expect(travelFL.updatedAt).toBeDefined();
  });

  test('timestamps test currentTime', async () => {
    const schema = new Schema(
      { title: String, createdAt: Number, updatedAt: Number },
      { timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } },
    );
    const Travel = model('Travel', schema);
    await startInTest(getDefaultInstance());
    const travelCH = await Travel.create({ title: 'go to CH' });
    expect(travelCH.createdAt).toBeDefined();
    expect(travelCH.updatedAt).toBeDefined();
  });

  test('timestamps test currentTime with update', async () => {
    const schema = new Schema(
      { title: String, createdAt: Number, updatedAt: Number },
      { timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } },
    );
    const Travel = model('Travel', schema);
    await startInTest(getDefaultInstance());
    const travelCH = await Travel.create({ title: 'go to CH' });
    expect(typeof travelCH.createdAt).toBe('number');
    expect(typeof travelCH.updatedAt).toBe('number');
    await delay(5000);
    travelCH.title = 'go to CH Updated';
    await travelCH.save();
    expect(travelCH.updatedAt).toBeDefined();
    expect(typeof travelCH.updatedAt).toBe('number');
  });

  test('nested timestamp create and update', async () => {
    const modelKey = 'metadata.doc_type';

    const metadataSchema = new Schema(
      {
        doc_type: String,
      },
      { timestamps: true },
    );

    const schema = new Schema({
      name: String,
      age: Number,
      metadata: metadataSchema,
    });

    const User = model('UserTimestamp', schema, { modelKey });
    await startInTest(getDefaultInstance());
    const data = new User({ name: 'Jane Doe', age: 20 });

    const doc = await data.save();
    expect(doc.name).toBe('Jane Doe');
    expect(doc.metadata.doc_type).toBe('UserTimestamp');
    expect(doc.metadata.createdAt).toBeDefined();
    expect(doc.metadata.updatedAt).toBeDefined();

    await delay(3000);
    const user = await User.updateById(doc.id, { age: 21 });

    expect(user.age).toBe(21);
    expect(doc.metadata.doc_type).toBe('UserTimestamp');
    expect(doc.metadata.createdAt).toBeDefined();
    expect(doc.metadata.updatedAt).toBeDefined();
  });

  test('nested timestamp create and update with currentTime', async () => {
    const modelKey = 'metadata.doc_type';

    const metadataSchema = new Schema(
      {
        doc_type: String,
        createdAt: Number,
        updatedAt: Number,
      },
      { timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } },
    );

    const schema = new Schema({
      name: String,
      age: Number,
      metadata: metadataSchema,
    });

    const User = model('UserTimestampNumber', schema, { modelKey });
    await startInTest(getDefaultInstance());
    const data = new User({ name: 'Jane Doe', age: 20 });
    const doc = await data.save();

    expect(doc.name).toBe('Jane Doe');
    expect(doc.metadata.doc_type).toBe('UserTimestampNumber');
    expect(typeof doc.metadata.createdAt).toBe('number');
    expect(typeof doc.metadata.updatedAt).toBe('number');

    await delay(3000);
    const user = await User.updateById(doc.id, { age: 21 });

    expect(user.age).toBe(21);
    expect(doc.metadata.doc_type).toBe('UserTimestampNumber');
    expect(typeof doc.metadata.createdAt).toBe('number');
    expect(typeof doc.metadata.updatedAt).toBe('number');
  });
});
