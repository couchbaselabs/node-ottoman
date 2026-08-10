import { Query } from '../src';

describe('Test N1QL injection hardening', () => {
  test('A string value containing a double quote cannot terminate the literal', async () => {
    const injected = 'x" OR 1=1 OR name="';
    const query = new Query({}, 'travel-sample').select('*').where({ name: injected }).build();

    // The value must survive as a single escaped literal, not as extra N1QL syntax.
    expect(query).toStrictEqual(`SELECT * FROM \`travel-sample\` WHERE name=${JSON.stringify(injected)}`);
    expect(query).not.toContain('OR 1=1 OR name=""');
  });

  test('Backslashes in a value are preserved instead of being stripped', async () => {
    const windowsPath = 'C:\\Users\\bob';
    const query = new Query({}, 'travel-sample').select('*').where({ path: windowsPath }).build();

    expect(query).toStrictEqual(`SELECT * FROM \`travel-sample\` WHERE \`path\`=${JSON.stringify(windowsPath)}`);
  });

  test('A quote inside a USE KEYS value cannot introduce another key', async () => {
    const injected = 'a" , "b';
    const query = new Query({}, 'travel-sample').select('*').useKeys([injected]).build();

    expect(query).toStrictEqual(`SELECT * FROM \`travel-sample\` USE KEYS ${JSON.stringify([injected])}`);
  });

  test('A quote inside a comparison value cannot terminate the literal', async () => {
    const injected = '%57%" OR "1"="1';
    const query = new Query({}, 'travel-sample')
      .select('*')
      .where({ address: { $like: injected } })
      .build();

    expect(query).toStrictEqual(
      `SELECT * FROM \`travel-sample\` WHERE address LIKE ${JSON.stringify(injected)}`,
    );
  });
});
