import { getDefaultInstance, IManyQueryResponse, model, SearchConsistency } from '../src';
import { startInTest } from './testData';

test('Test Create Many', async () => {
  const Box = model('Box', { name: String, price: Number });
  await startInTest(getDefaultInstance());
  const docs = [{ name: 'Xbox' }, { name: 'Yellow Box' }];
  const queryResult: IManyQueryResponse = await Box.createMany(docs);
  expect(queryResult.message.success).toBe(docs.length);
  const boxs = await Box.find({}, { consistency: SearchConsistency.LOCAL });
  expect(boxs.rows.length).toBeGreaterThanOrEqual(2);
  const cleanUp = async () => await Box.removeMany({ _type: 'Box' });
  await cleanUp();
});

test('Test Create Many Errors ', async () => {
  const Box = model('Box', { name: String, price: { required: true, type: Number } });
  await startInTest(getDefaultInstance());
  const docs = [{ name: 'Xbox', price: 10 }, { name: 'Yellow Box' }];
  const queryResult: IManyQueryResponse = await Box.createMany(docs);
  expect(queryResult.message.success).toBe(1);
  expect(queryResult.message.errors.length).toBe(1);
  expect(queryResult.message.errors[0].exception).toBe('ValidationError');
  const cleanUp = async () => await Box.removeMany({ _type: 'Box' });
  await cleanUp();
});
