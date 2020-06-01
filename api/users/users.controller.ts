import express from 'express';
import { UserModel } from './users.model';
const router = express();

router.get('/', (req, res) => {
  res.json([]);
});

router.post('/', async (req, res) => {
  const user = new UserModel({ name: 'Jane', isActive: true, age: 37 });
  const result = await user.save();
  res.json(result);
});

export const UserRoutes = router;
