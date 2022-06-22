import { model, Schema, SearchConsistency, getDefaultInstance, set } from '../src';
import { startInTest } from './testData';

describe('Query Builder Array', () => {
  const houseSchema = new Schema({
    title: String,
    address: {
      line1: String,
      line2: String,
      state: String,
    },
    numbers: [Number],
  });

  test('Basics', async () => {
    const House = model('House', houseSchema);
    await startInTest(getDefaultInstance());

    const house = new House({
      title: 'Beach House',
      address: { line1: 'miami beach', state: 'FL' },
      numbers: [1, 5, 10, 156788],
    });
    await house.save();

    const filter = {
      title: 'Beach House',
      $any: {
        $expr: [{ search: { $in: 'numbers' } }],
        $satisfies: { search: 10 },
      },
    };

    const results = await House.find(filter, { consistency: SearchConsistency.LOCAL });
    expect(results.rows.length).toBeGreaterThanOrEqual(1);
  });
});
