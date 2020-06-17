import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { UserRoutes } from './users/users.controller';
import { ensureIndexes } from '../lib/model/index/ensure-indexes';
import { AirportRoutes } from './airports/airports.controller';

const app = express();

app.use(express.json());
app.get('/', (req, res) => {
  res.send('index');
});
app.use('/users', UserRoutes);
app.use('/airports', AirportRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(YAML.load('./api/swagger.yaml')));

ensureIndexes()
  .then(() => {
    console.log('All the indexes were registered');
    const port = 4500;
    app.listen(port, () => {
      console.log(`API started at http://localhost:${port}`);
    });
  })
  .catch((e) => console.log(e));
