import { searchQuery, SearchQuery } from '../src';

const maybe = process.env.CI ? test.skip : test;

maybe('fts match results', async () => {
  const result = await searchQuery('hotels', SearchQuery.match('Gillingham'), { limit: 5 });
  expect(result).toBeDefined();
  expect(result.rows.length).toBeGreaterThanOrEqual(1);
  expect(result.rows[0].id).toBeDefined();
});

maybe('fts matchPhrase basic', async () => {
  const result = await searchQuery('hotels', SearchQuery.matchPhrase('Medway Youth Hostel'), { limit: 5 });
  expect(result).toBeDefined();
  expect(result.rows.length).toBeGreaterThanOrEqual(1);
  expect(result.rows[0].id).toBe('hotel_10025');
});

maybe('fts conjuncts results', async () => {
  const query = SearchQuery.conjuncts(SearchQuery.match('Berkeley'), SearchQuery.matchPhrase('luxury hotel'));
  const result = await searchQuery('hotels', query);
  expect(result).toBeDefined();
  expect(result.rows.length).toBeGreaterThanOrEqual(1);
  expect(result.rows[0].id).toBeDefined();
});

maybe('fts disjunction results', async () => {
  const query = SearchQuery.disjuncts(SearchQuery.match('Louvre'), SearchQuery.match('Eiffel'));
  const result = await searchQuery('hotels', query);
  expect(result).toBeDefined();
  expect(result.rows.length).toBeGreaterThanOrEqual(1);
  expect(result.rows[0].id).toBeDefined();
});
