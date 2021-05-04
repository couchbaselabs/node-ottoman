import { getDefaultInstance, IManyQueryResponse, model, SearchConsistency } from '../src';
import { startInTest } from './testData';
import { ManyQueryResponse, StatusExecution } from '../src/handler';

test('Test Create Many', async () => {
  const Box = model('Box', { name: String, price: Number });
  await startInTest(getDefaultInstance());
  const docs = [{ name: 'Xbox' }, { name: 'Yellow Box' }];
  const queryResult: IManyQueryResponse = await Box.createMany(docs);
  const boxs = await Box.find({}, { consistency: SearchConsistency.LOCAL });
  const cleanUp = async () => await Box.removeMany({ _type: 'Box' });
  await cleanUp();
  expect(queryResult.message.success).toBe(docs.length);
  expect(boxs.rows.length).toBeGreaterThanOrEqual(2);
});

test('Test Create Many Errors ', async () => {
  const Box = model('Box', { name: String, price: { required: true, type: Number } });
  await startInTest(getDefaultInstance());
  const docs = [{ name: 'Xbox', price: 10 }, { name: 'Yellow Box' }];
  const queryResult: IManyQueryResponse = await Box.createMany(docs);
  const cleanUp = async () => await Box.removeMany({ _type: 'Box' });
  await cleanUp();
  expect(queryResult.message.success).toBe(1);
  expect(queryResult.message.errors.length).toBe(1);
  expect(queryResult.message.errors[0].exception).toBe('ValidationError');
});

test('Test Create Many Errors JSON Strict ', async () => {
  const Box = model('Box', { name: String, price: { required: true, type: Number } });
  await startInTest(getDefaultInstance());
  const docs = [{ name: 'Xbox', price: 10 }, { name: 'Yellow Box' }];
  const queryResult: IManyQueryResponse = await Box.createMany(docs);

  const queryResultJson: IManyQueryResponse = {
    status: 'FAILURE',
    message: {
      success: 1,
      match_number: 2,
      errors: [
        {
          payload: {
            name: 'Yellow Box',
          },
          status: 'FAILURE',
          exception: 'ValidationError',
          message: 'Property price is required',
        },
      ],
    },
  };
  const cleanUp = async () => await Box.removeMany({ _type: 'Box' });
  await cleanUp();
  expect(JSON.stringify(queryResult)).toStrictEqual(JSON.stringify(queryResultJson));
});

test('Test Create Many Errors Class Strict ', async () => {
  const Box = model('Box', { name: String, price: { required: true, type: Number } });
  await startInTest(getDefaultInstance());
  const docs = [{ name: 'Xbox', price: 10 }, { name: 'Yellow Box' }];
  const queryResult: IManyQueryResponse = await Box.createMany(docs);

  const queryResultClass = new ManyQueryResponse('FAILURE', {
    success: 1,
    match_number: 2,
    errors: [
      new StatusExecution(
        {
          name: 'Yellow Box',
        },
        'FAILURE',
        'ValidationError',
        'Property price is required',
      ),
    ],
  });

  const cleanUp = async () => await Box.removeMany({ _type: 'Box' });
  await cleanUp();
  expect(queryResult).toStrictEqual(queryResultClass);
});
