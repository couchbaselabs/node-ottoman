import { model } from '../lib';

describe('Test Model utilities methods', () => {
  test('model.toCoo', () => {
    const Cat = model('Cat', { name: String });
    const catObject = { name: 'figaro' };
    const cat = new Cat(catObject);
    expect(cat.toCoo()).toStrictEqual(catObject);
  });

  test('model.toJson', () => {
    const Cat = model('Cat', { name: String });
    const catObject = { name: 'figaro' };
    const cat = new Cat(catObject);
    expect(cat.toJSON()).toBe(JSON.stringify(catObject));
  });
});
