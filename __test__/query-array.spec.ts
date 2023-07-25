import { model, Schema, SearchConsistency, getDefaultInstance, set, Query } from '../src';
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

    const house2 = new House({
      title: 'City House',
      address: { line1: 'city house', state: 'FL' },
      numbers: [1, 5],
    });
    await house2.save();

    const house3 = new House({
      title: 'Highway House',
      address: { line1: 'Highway house', state: 'FL' },
      numbers: [1, 5, 4000000],
    });
    await house3.save();

    const filter = {
      $any: {
        $expr: [{ search: { $in: 'numbers' } }],
        $satisfies: { search: { $gte: 5, $lte: 15 } },
      },
    };

    const results = await House.find(filter, { sort: { 'numbers[-1]': 'DESC' }, consistency: SearchConsistency.LOCAL });
    expect(results.rows.length).toBeGreaterThanOrEqual(1);
  });
});
