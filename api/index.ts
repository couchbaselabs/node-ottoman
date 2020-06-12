import express from 'express';
import { UserRoutes } from './users/users.controller';
import { ensureIndexes } from '../src/model/index/ensure-indexes';
const app = express();

app.use(express.json());
app.get('/', (req, res) => {
  res.send('index');
});
app.use('/users', UserRoutes);

ensureIndexes()
  .then(() => {
    console.log('All the indexes were registered');
    const port = 4500;
    app.listen(port, () => {
      console.log(`API started at http://localhost:${port}`);
    });
  })
  .catch((e) => console.log(e));
