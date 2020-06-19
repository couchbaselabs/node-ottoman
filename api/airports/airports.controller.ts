import express from 'express';
import { AirportModel } from './airports.model';
import { makeResponse } from '../shared/make.response';
import { FindOptions } from '../../lib/handler/find/find-options';

const router = express();

router.get('/', async (req, res) => {
  await makeResponse(res, async () => {
    const options = new FindOptions({ limit: Number(req.query.limit || 50), skip: Number(req.query.skip || 0) });
    const filter = req.query.search ? { airportname: { $like: `%${req.query.search}%` } } : {};
    const result = await AirportModel.find(filter, options);
    const { rows: items } = result;
    return {
      items,
    };
  });
});

router.get('/:id', async (req, res) => {
  await makeResponse(res, () => AirportModel.findById(req.params.id));
});

router.post('/', async (req, res) => {
  await makeResponse(res, () => {
    res.status(201);
    const airport = new AirportModel(req.body);
    return airport.save();
  });
});

router.patch('/:id', async (req, res) => {
  await makeResponse(res, async () => {
    res.status(204);
    await AirportModel.update(req.body, req.params.id);
  });
});

router.put('/:id', async (req, res) => {
  await makeResponse(res, async () => {
    await AirportModel.replace(req.body, req.params.id);
    res.status(204);
  });
});

router.delete('/:id', async (req, res) => {
  await makeResponse(res, async () => {
    await AirportModel.remove(req.params.id);
    res.status(204);
  });
});

export const AirportRoutes = router;
