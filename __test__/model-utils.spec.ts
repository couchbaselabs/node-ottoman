import { model } from '../src';
import { arrayDiff } from '../src/model/utils/array-diff';

describe('Test Model utilities methods', () => {
  test('model.toObject', () => {
    const Cat = model('Cat', { name: String });
    const catObject = { name: 'figaro' };
    const cat = new Cat(catObject);
    expect(cat.toObject()).toStrictEqual(catObject);
  });

  test('model.toJson', async () => {
    const Cat = model('Cat', { name: String });
    const catObject = { name: 'figaro' };
    const cat = new Cat(catObject);
    expect(JSON.stringify(cat)).toBe(JSON.stringify(catObject));
  });

  test('arrayDiff', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [3, 4];
    expect(arrayDiff(arr1, arr2)).toStrictEqual([1, 2]);
  });
});
