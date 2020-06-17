import express from 'express';
import { UserModel } from './users.model';
import { FindOptions } from '../../lib/handler/find/find-options';
import { makeResponse } from '../shared/make.response';

const router = express();

router.get('/', async (req, res) => {
  await makeResponse(res, () => UserModel.find());
});

router.get('/byEmail/:email', async (req, res) => {
  await makeResponse(res, () => {
    const options = new FindOptions({ select: 'name settings', limit: 2 });
    return UserModel.findByEmail(req.params.email, options);
  });
});

router.get('/:id', async (req, res) => {
  await makeResponse(res, () => UserModel.findById(req.params.id, { select: 'settings' }));
});

router.post('/', async (req, res) => {
  await makeResponse(res, () => {
    const user = new UserModel(req.body);
    return user.save();
  });
});

router.patch('/:id', async (req, res) => {
  await makeResponse(res, () => {
    return UserModel.update(req.body, req.params.id);
  });
});

router.put('/:id', async (req, res) => {
  await makeResponse(res, () => {
    return UserModel.replace(req.body, req.params.id);
  });
});

router.delete('/:id', async (req, res) => {
  await makeResponse(res, () => {
    return UserModel.remove(req.params.id);
  });
});

export const UserRoutes = router;
