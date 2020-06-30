import express from 'express';
import { HotelModel } from './hotels.model';
import { makeResponse } from '../shared/make.response';
import { FindOptions } from '../../lib/handler/find/find-options';
const router = express();

router.get('/', async (req, res) => {
  await makeResponse(res, async () => {
    const options = new FindOptions({ limit: Number(req.query.limit || 50), skip: Number(req.query.skip || 0) });
    const filter = req.query.search ? { name: { $like: `%${req.query.search}%` } } : {};
    const result = await HotelModel.find(filter, options);
    const { rows: items } = result;
    return {
      items,
    };
  });
});

router.get('/:id', async (req, res) => {
  await makeResponse(res, () => HotelModel.findById(req.params.id));
});

router.post('/', async (req, res) => {
  await makeResponse(res, () => {
    res.status(201);
    const airport = new HotelModel(req.body);
    return airport.save();
  });
});

router.patch('/:id', async (req, res) => {
  await makeResponse(res, async () => {
    res.status(204);
    await HotelModel.update(req.body, req.params.id);
  });
});

router.put('/:id', async (req, res) => {
  await makeResponse(res, async () => {
    await HotelModel.replace(req.body, req.params.id);
    res.status(204);
  });
});

router.delete('/:id', async (req, res) => {
  await makeResponse(res, async () => {
    await HotelModel.remove(req.params.id);
    res.status(204);
  });
});

export const HotelRoutes = router;
