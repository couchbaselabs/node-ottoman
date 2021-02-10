import { getDefaultInstance, IManyQueryResponse, model, Schema } from '../src';
import { delay, startInTest } from './testData';
import { StatusExecution } from '../src/handler';

describe('Test Schema Immutable', () => {
  const CardSchemaBase = new Schema({
    cardNumber: { type: String, immutable: true },
    zipCode: String,
  });
  const cardInfo = {
    cardNumber: '5678 5678 5678 5678',
    zipCode: '56789',
  };
  const cardInfoUpdate = {
    cardNumber: '4321 4321 4321 4321',
    zipCode: '43210',
  };

  test("Test Schema Immutable integration on strict=false'", async () => {
    const CardSchema = new Schema(CardSchemaBase, { strict: false });
    const Card = model('Card', CardSchema);
    await startInTest(getDefaultInstance());
    const result = await Card.create(cardInfo);
    await delay(500);
    result.cardNumber = '80';
    await Card.removeById(result.id);
    expect(result.cardNumber).toBe('80');
  });
  test('Test Schema Immutable integration on strict=true', async () => {
    const Card = model('Card', CardSchemaBase);
    await startInTest(getDefaultInstance());
    const result = await Card.create(cardInfo);
    await delay(500);
    result.cardNumber = '80';
    await Card.removeById(result.id);
    expect(result.cardNumber).toBe(cardInfo.cardNumber);
  });
  test('Test Schema Immutable integration -> findOne', async () => {
    const Card = model('Card', CardSchemaBase);
    await startInTest(getDefaultInstance());
    await Card.create(cardInfo);
    await delay(500);
    const result = await Card.findOne({ cardNumber: '5678 5678 5678 5678' });
    result.cardNumber = '80';
    await Card.removeById(result.id);
    expect(result.cardNumber).toBe(cardInfo.cardNumber);
  });
  test('Test Schema Immutable integration -> findById', async () => {
    const Card = model('Card', CardSchemaBase);
    await startInTest(getDefaultInstance());
    const { id } = await Card.create(cardInfo);
    await delay(500);
    const result = await Card.findById(id);
    result.cardNumber = '80';
    await Card.removeById(result.id);
    expect(result.cardNumber).toBe(cardInfo.cardNumber);
  });
  test('Test Schema Immutable integration -> Update a document', async () => {
    const Card = model('Card', CardSchemaBase);
    await startInTest(getDefaultInstance());
    const { id } = await Card.create(cardInfo);
    await delay(500);
    try {
      await Card.updateById(id, cardInfoUpdate);
    } catch (e) {
      expect((e as Error).message).toBe("Field 'cardNumber' is immutable and current cast strategy is set to 'throw'");
    }
    const card = await Card.findById(id);
    await Card.removeById(id);
    expect(card.cardNumber).toBe('5678 5678 5678 5678');
    expect(card.zipCode).toBe('56789');
  });
  test('Test Schema Immutable integration -> Replace a document', async () => {
    const Card = model('Card', CardSchemaBase);
    await startInTest(getDefaultInstance());
    const { id } = await Card.create(cardInfo);
    await delay(500);
    await Card.replaceById(id, cardInfoUpdate);
    const card = await Card.findById(id);
    await Card.removeById(id);
    expect(card.cardNumber).toBe('5678 5678 5678 5678');
    expect(card.zipCode).toBe('43210');
  });
  test('Test Schema Immutable integration -> findOneAndUpdate new:true', async () => {
    const Card = model('Card', CardSchemaBase);
    await startInTest(getDefaultInstance());
    await Card.create(cardInfo);
    await delay(500);
    const card = await Card.findOneAndUpdate({ cardNumber: { $like: '%5678 5678 5678 5678%' } }, cardInfoUpdate, {
      new: true,
    });
    await Card.removeById(card.id);
    expect(card.cardNumber).toBe('5678 5678 5678 5678');
    expect(card.zipCode).toBe('43210');
  });
  test('Test Schema Immutable integration -> findOneAndUpdate new:false', async () => {
    const Card = model('Card', CardSchemaBase);
    await startInTest(getDefaultInstance());
    await Card.create(cardInfo);
    await delay(500);
    const card = await Card.findOneAndUpdate({ cardNumber: { $like: '%5678 5678%' } }, cardInfoUpdate, { new: false });
    await Card.removeById(card.id);
    expect(card.cardNumber).toBe('5678 5678 5678 5678');
    expect(card.zipCode).toBe('56789');
  });
  test('Test Schema Immutable integration -> updateMany', async () => {
    const CardSchema = new Schema({
      cardNumber: String,
      zipCode: { type: String, immutable: true },
    });
    const Card = model('CardMany', CardSchema);
    await startInTest(getDefaultInstance());

    let card1;
    let card2;

    const batchCreate = async () => {
      card1 = await Card.create({ cardNumber: '5678 5678 1111 1111', zipCode: '11111' });
      card2 = await Card.create({ cardNumber: '5678 5678 2222 2222', zipCode: '22222' });
    };
    await batchCreate();
    await delay(500);
    const response: IManyQueryResponse = await Card.updateMany(
      { cardNumber: { $like: '%5678 5678%' } },
      { zipCode: '12345' },
    );
    const result1 = await Card.findById(card1.id);
    const result2 = await Card.findById(card2.id);

    await delay(500);
    const cleanUp = async () => await Card.removeMany({ _type: 'CardMany' });
    await cleanUp();
    response.message.errors.map(({ status, message }: StatusExecution) => {
      expect(status).toBe('FAILURE');
      expect(message).toBe("Field 'zipCode' is immutable and current cast strategy is set to 'throw'");
    });
    expect(response.message.success).toBe(0);
    expect(response.message.match_number).toBe(2);
    expect(result1.zipCode).toBe('11111');
    expect(result2.zipCode).toBe('22222');
  });
});
