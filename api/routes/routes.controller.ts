import express from 'express';
import { jwtMiddleware } from '../shared/protected.router';
import { RouteModel } from './routes.model';
import { AirportModel } from '../airports/airports.model';
import { makeResponse } from '../shared/make.response';
import { FindOptions } from '../../lib/handler/find/find-options';
const router = express();

router.get('/', jwtMiddleware, async (req, res) => {
  await makeResponse(res, async () => {
    const { limit, skip, from, to } = req.query;
    const fromDocument = await AirportModel.findById(from, { select: 'faa' });
    const toDocument = await AirportModel.findById(to, { select: 'faa' });
    const filter = {
      sourceairport: fromDocument.faa,
      destinationairport: toDocument.faa,
    };
    const result = await RouteModel.find(
      filter,
      new FindOptions({
        limit: Number(limit || 50),
        skip: Number(skip || 0),
      }),
    );
    const { rows: items } = result;
    return {
      items,
    };
  });
});

router.get('/:id', jwtMiddleware, async (req, res) => {
  await makeResponse(res, () => RouteModel.findById(req.params.id));
});

router.post('/', jwtMiddleware, async (req, res) => {
  await makeResponse(res, () => {
    res.status(201);
    const airport = new RouteModel(req.body);
    return airport.save();
  });
});

router.patch('/:id', jwtMiddleware, async (req, res) => {
  await makeResponse(res, async () => {
    res.status(204);
    await RouteModel.update(req.body, req.params.id);
  });
});

router.put('/:id', jwtMiddleware, async (req, res) => {
  await makeResponse(res, async () => {
    await AirportModel.replace(req.body, req.params.id);
    res.status(204);
  });
});

router.delete('/:id', jwtMiddleware, async (req, res) => {
  await makeResponse(res, async () => {
    await RouteModel.remove(req.params.id);
    res.status(204);
  });
});

export const RouteRoutes = router;
