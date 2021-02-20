import { getDefaultInstance, model, Schema, ValidationError } from '../src';
import { delay, startInTest } from './testData';
import { cast, CAST_STRATEGY } from '../src/utils/cast-strategy';
import { BuildIndexQueryError } from '../src/exceptions/ottoman-errors';

const CardSchemaBase = new Schema({
  cardNumber: { type: String },
  zipCode: String,
});

const cardInfo = {
  cardNumber: '5678 5678 5678 5678',
  zipCode: '56789',
};

describe('Errors Name', () => {
  test('-> Indexes -> BuildIndexQueryError', async () => {
    const CardSchema = new Schema(CardSchemaBase);
    CardSchema.index.findByCardNumber = {
      by: 'number',
      type: 'view',
    };
    const Card = model('Card', CardSchema);
    await startInTest(getDefaultInstance());
    const result = await Card.create(cardInfo);
    await delay(500);
    try {
      await Card.findByCardNumber();
    } catch (e) {
      const { message } = e;
      expect(e).toBeInstanceOf(BuildIndexQueryError);
      expect(message).toBe(`Function 'findByCardNumber' received wrong argument value, 'undefined' wasn't expected`);
    }
    try {
      await Card.findByCardNumber([]);
    } catch (e) {
      const { message } = e;
      expect(e).toBeInstanceOf(BuildIndexQueryError);
      expect(message).toBe(
        `Function 'findByCardNumber' received wrong number of arguments, '1:[number]' argument(s) was expected and '0:[]' were received`,
      );
    }
    await Card.removeById(result.id);
  });
  test('-> Indexes -> BuildIndexQueryError -> wrong index type', async () => {
    const CardSchema = new Schema(CardSchemaBase);
    CardSchema.index.findByCardNumber = {
      by: 'number',
      type: ('dummyIndexType' as unknown) as undefined,
    };
    try {
      model('Card', CardSchema);
    } catch (e) {
      const { message } = e;
      expect(e).toBeInstanceOf(BuildIndexQueryError);
      expect(message).toBe(
        `Unexpected index type 'dummyIndexType' in index 'findByCardNumber', was expected 'refdoc', 'n1ql' or 'view'`,
      );
    }

    // await Card.removeById(result.id);
  });

  test('-> Indexes -> BuildIndexQueryError -> wrong number of arguments for n1ql/undefined type', async () => {
    const CardSchema = new Schema(CardSchemaBase);
    CardSchema.index.findByCardNumber = {
      by: 'cardNumber',
      type: 'n1ql',
    };
    const Card = model('Card', CardSchema);
    try {
      await Card.findByCardNumber(['cardNumber', 'zipCode']);
    } catch (e) {
      const { message } = e;
      expect(e).toBeInstanceOf(BuildIndexQueryError);
      expect(message).toBe(
        `Function 'findByCardNumber' received wrong number of arguments, '1:[cardNumber]' argument(s) was expected and '2:[cardNumber,zipCode]' were received`,
      );
    }
  });
  test('-> Cast', () => {
    const schema = new Schema({ name: String, age: Number });
    try {
      cast({ name: 'jane', age: 3 }, schema, { strategy: CAST_STRATEGY.KEEP, strict: true });
    } catch (e) {
      const { message } = e;
      expect(e).toBeInstanceOf(ValidationError);
      expect(message).toBe(`Cast Strategy 'keep' or 'defaultOrKeep' isn't support when strict is set to true.`);
    }
  });
});
