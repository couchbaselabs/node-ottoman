import { model } from '../src';

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
});
