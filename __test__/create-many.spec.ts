import { getDefaultInstance, model, SearchConsistency } from '../src';
import { startInTest } from './testData';

test('createMany', async () => {
  const Box = model('Box', { name: String, price: Number });
  await startInTest(getDefaultInstance());
  const docs = [{ name: 'Xbox' }, { name: 'Yellow Box' }];
  const queryResult = await Box.createMany(docs);
  expect(queryResult.message.success).toBe(docs.length);
  const boxs = await Box.find({}, { consistency: SearchConsistency.LOCAL });
  expect(boxs.rows.length).toBeGreaterThanOrEqual(2);
});
