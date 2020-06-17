import express from 'express';
import { AirportModel } from './airports.model';
import { makeResponse } from '../shared/make.response';
const router = express();

router.get('/', async (req, res) => {
  await makeResponse(res, async () => {
    const result = await AirportModel.find();
    const { rows: airports, count } = result;
    return {
      items: airports,
      count,
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
