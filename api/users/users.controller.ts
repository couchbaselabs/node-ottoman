import express from 'express';
import { UserModel } from './users.model';
import { FindOptions } from '../../src/handler/find/find-options';
const router = express();

router.get('/', async (req, res) => {
  const users = await UserModel.find();
  res.json(users);
});

router.get('/byEmail/:email', async (req, res) => {
  const options = new FindOptions({ select: 'name settings', limit: 2 });
  const users = await UserModel.findByEmail(req.params.email, options);
  res.json(users);
});

router.get('/:id', async (req, res) => {
  const users = await UserModel.findById(req.params.id, { select: 'settings' });
  res.json(users);
});

router.post('/', async (req, res) => {
  const user = new UserModel(req.body);
  const result = await user.save();
  res.json(result);
});

router.patch('/:id', async (req, res) => {
  const result = await UserModel.update(req.body, req.params.id);
  res.json(result);
});

router.put('/:id', async (req, res) => {
  const result = await UserModel.replace(req.body, req.params.id);
  res.json(result);
});

router.delete('/:id', async (req, res) => {
  const result = await UserModel.remove(req.params.id);
  res.json(result);
});

export const UserRoutes = router;
