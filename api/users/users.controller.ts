import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from './users.model';
import { makeResponse } from '../shared/make.response';
import { FindOptions } from '../../src/handler/find/find-options';
import { isDocumentNotFoundError } from '../../src/utils/is-not-found';
const router = express();
const authRouter = express();

authRouter.post('/login', async (req, res) => {
  await makeResponse(res, async () => {
    const { username, password } = req.body;
    const { rows: result } = await UserModel.findByName(username, { select: '`password`' });
    const user = result[0];
    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ user }, 'ottoman.js', {
        expiresIn: '24h',
      });

      // eslint-disable-next-line no-unused-vars
      const { password: pwd, ...userWithoutPass } = user;

      res.json({
        user: userWithoutPass,
        token,
      });
    } else {
      res.status(401).json({
        message: 'Unauthenticated',
      });
    }
  });
});

authRouter.post('/register', async (req, res) => {
  await makeResponse(res, () => {
    req.body.password = bcrypt.hashSync(req.body.password, 10);
    const user = new UserModel(req.body);
    return user.save();
  });
});

router.get('/', async (req, res) => {
  await makeResponse(res, () => UserModel.find());
});

router.get('/n1ql/:email', async (req, res) => {
  const options = new FindOptions({ select: 'name settings', limit: 2 });
  const users = await UserModel.findByEmail(req.params.email, options);
  res.json(users);
});

router.get('/byEmail/:email', async (req, res) => {
  await makeResponse(res, () => {
    const options = new FindOptions({ select: 'name settings', limit: 2 });
    return UserModel.findByEmail(req.params.email, options);
  });
});

router.get('/view/:email', async (req, res) => {
  try {
    const users = await UserModel.findViewByEmail(req.params.email, { limit: 1 });
    res.json(users);
  } catch (e) {
    console.log(e);
  }
});

router.get('/ref/:name', async (req, res) => {
  try {
    const user = await UserModel.findRefName(req.params.name);
    res.json(user);
  } catch (e) {
    if (isDocumentNotFoundError(e)) {
      return res.status(404).send({ code: 404, message: 'Document not found' });
    }
    return res.json(e);
  }
});

router.get('/:id', async (req, res) => {
  await makeResponse(res, () => UserModel.findById(req.params.id, { select: 'settings' }));
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
export const AuthRoutes = authRouter;
